/**
 * Listen for events of Type T
 */
export type IListener<T> = (event: T) => any;

export interface IDisposable {
  dispose(): void;
}

/**
 * Typed EventEmitter, passes through events as they happen.
 * You will not get events from before you start listening
 *
 * @see https://basarat.gitbooks.io/typescript/docs/tips/typed-event.html
 *
 * Usage:
 * const onFoo = new EventEmitter<Foo>();
 * const onBar = new EventEmitter<Bar>();
 *
 * // Emit:
 * onFoo.emit(foo);
 * onBar.emit(bar);
 *
 * // Listen:
 * onFoo.on((foo)=>console.log(foo));
 * onBar.on((bar)=>console.log(bar));
 */
export class EventEmitter<T> {
  private listeners: Array<IListener<T>> = [];
  private listenersOncer: Array<IListener<T>> = [];

  public on(listener: IListener<T>): IDisposable {
    this.listeners.push(listener);
    return {
      dispose: () => this.off(listener),
    };
  }

  public once(listener: IListener<T>): void {
    this.listenersOncer.push(listener);
  }

  public off(listener: IListener<T>) {
    const callbackIndex = this.listeners.indexOf(listener);
    if (callbackIndex > -1) { this.listeners.splice(callbackIndex, 1); }
  }

  public emit(event: T) {
    /** Update any general listeners */
    this.listeners.forEach((listener) => listener(event));

    /** Clear the `once` queue */
    this.listenersOncer.forEach((listener) => listener(event));
    this.listenersOncer = [];
  }

  public pipe(te: EventEmitter<T>): IDisposable {
    return this.on((e) => te.emit(e));
  }
}
