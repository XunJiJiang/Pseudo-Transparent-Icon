import { Func } from '@type/function'

enum State {
  Pending,
  Running
}

export default class AutoAsyncTask {
  private static taskLists = [new Map<Func, Func>(), new Map<Func, Func>()]
  private static promise: Promise<void> | null = null
  private static state = State.Pending

  static addTask(task: Func, key?: Func) {
    const taskList = this.taskLists[this.state]
    if (taskList.has(key ?? task)) taskList.delete(key ?? task)
    taskList.set(key ?? task, task)
    if (this.state === State.Pending) this.run()
  }

  private static run() {
    const taskList = this.taskLists[0]
    if (this.promise) return
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
        this.state = State.Pending
        this.promise = null
        this.taskLists.reverse()
        if (this.taskLists[0].size) this.run()
      })
  }
}
