import { Func } from '@type/function'

export default class AutoAsyncTask {
  private static tasks = new Map<Func, Func>()
  private static promise: Promise<void> | null = null

  static addTask(task: Func, key?: Func) {
    if (this.tasks.has(key ?? task)) this.tasks.delete(key ?? task)
    this.tasks.set(key ?? task, task)
    this.run()
  }

  private static run() {
    if (this.promise) return
    this.promise = Promise.resolve()
    this.promise
      .then(() => {
        this.tasks.forEach((task, key, map) => {
          task()
          map.delete(key)
        })
      })
      .finally(() => {
        this.promise = null
      })
  }
}
