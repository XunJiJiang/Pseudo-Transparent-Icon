import { Func } from '@type/function'

enum State {
  Pending,
  Running,
  Done
}

export class AutoAsyncTask {
  private static taskLists = [new Map<Func, Func>(), new Map<Func, Func>()]
  private static promise: Promise<void> | null = null
  private static state = State.Done

  static addTask(task: Func, key?: Func) {
    const index = this.state === State.Running ? 1 : 0
    const taskList = this.taskLists[index]
    if (taskList.has(key ?? task)) taskList.delete(key ?? task)
    taskList.set(key ?? task, task)
    if (this.state !== State.Running) this.run()
  }

  private static run() {
    const taskList = this.taskLists[0]
    if (this.state !== State.Done) return
    this.state = State.Pending
    this.promise = Promise.resolve()
    this.promise
      .then(() => {
        this.state = State.Running
        taskList.forEach((task, key, map) => {
          task()
          map.delete(key)
        })
      })
      .finally(() => {
        this.state = State.Done
        this.promise = null
        this.taskLists.reverse()
        if (this.taskLists[0].size) this.run()
      })
  }
}

export const nextTick = (task: Func, key?: Func) => {
  AutoAsyncTask.addTask(task, key)
}
