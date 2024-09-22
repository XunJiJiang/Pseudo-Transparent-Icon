import { Func } from '@type/function'

export default class AsyncTaskQueue {
  private keys = new Set<Func | symbol | string | object>()
  private tasks = new Set<Func>()
  private promise: Promise<void> | null = null
  private finals = new Set<Func>()

  addTask(task: Func, key?: Func | symbol | string | object) {
    if (key && this.keys.has(key)) return
    this.tasks.add(task)
    if (key) this.keys.add(key)
  }

  clear() {
    this.tasks.clear()
    this.keys.clear()
    this.finals.clear()
  }

  run(clear: boolean = false) {
    if (this.promise) return
    this.promise = Promise.resolve()
    this.promise
      .then(() => {
        this.tasks.forEach((task) => task())
      })
      .finally(() => {
        this.finals.forEach((final) => final())
        if (clear) this.clear()
        this.promise = null
      })
  }

  runOnce() {
    this.run(true)
  }

  finally(cb: Func) {
    this.finals.add(cb)
  }
}
