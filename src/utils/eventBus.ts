/* eslint-disable @typescript-eslint/no-explicit-any */
export class EventBus {
  private bus = new Map<string, Set<(...args: any[]) => void>>()

  private static i = 0

  private i = EventBus.i++

  constructor() {}

  /** 注册事件监听器 */
  public subscribe(event: string, callback: (...args: any[]) => void) {
    if (!this.bus.has(event)) {
      this.bus.set(event, new Set())
    }
    this.bus.get(event)!.add(callback)

    return () => this.unsubscribe(event, callback)
  }

  /** 发布事件 */
  public publish(event: string, ...args: any[]) {
    if (this.bus.has(event)) {
      this.bus.get(event)!.forEach((callback) => callback(...args))
    }
  }

  /** 取消事件监听器 */
  public unsubscribe(event: string, callback: (...args: any[]) => void) {
    this.bus.get(event)?.delete(callback)
  }
}
