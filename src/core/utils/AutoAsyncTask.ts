import { Func } from '@type/function'

const idleTask = (() => {
  if ('requestIdleCallback' in window) {
    return (tasks: Func[]) => {
      const runner: IdleRequestCallback = (deadline) => {
        let task: Func | undefined
        while ((task = tasks.shift())) {
          if (deadline.timeRemaining() > 0) {
            task()
          } else {
            tasks.unshift(task)
            break
          }
        }
        requestIdleCallback(runner)
      }
      requestIdleCallback(runner)
    }
  }
  if ('requestAnimationFrame' in window) {
    return (tasks: Func[]) => {
      let timeout = 0
      const runner = () => {
        let task: Func | undefined
        timeout = Date.now() + 16
        while ((task = tasks.shift())) {
          task()
          if (Date.now() > timeout) {
            tasks.unshift(task)
            break
          }
        }
        requestAnimationFrame(runner)
      }
      requestAnimationFrame(runner)
    }
  }
  return (tasks: Func[]) => {
    tasks.forEach((task) => {
      Promise.resolve().then(task)
    })
  }
})()

enum STATE {
  Pending,
  Running,
  Done
}

export class AutoAsyncTask {
  private static tasks = new Map<Func, Func>()
  private static state = STATE.Done

  static addTask(task: Func, key?: Func) {
    if (this.tasks.has(key ?? task)) this.tasks.delete(key ?? task)
    this.tasks.set(key ?? task, task)
    if (this.state !== STATE.Running) this.run()
  }

  private static run() {
    if (this.state !== STATE.Done) return
    this.state = STATE.Pending

    Promise.resolve().then(() => {
      this.state = STATE.Running
      const tasks = Array.from(this.tasks.values())
      this.tasks.clear()
      tasks.push(() => {
        this.state = STATE.Done
        if (this.tasks.size) this.run()
      })
      idleTask(tasks)
    })
  }
}

export const nextTick = (task: Func, key?: Func) => {
  AutoAsyncTask.addTask(task, key)
}
