import { Context } from "koishi";

export class MiniQueue {
  private queue: (() => Promise<any>)[] = [];
  private isProcessing = false;
  private interval: number;
  private stopped = false;

  constructor(
    private ctx: Context,
    options: { interval: number } = { interval: 200 },
  ) {
    this.interval = options.interval;
  }

  public add<T>(task: () => Promise<T>): Promise<T> {
    if (this.stopped) {
      return Promise.reject(new Error("Queue has been disposed."));
    }
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this._process();
    });
  }

  public dispose() {
    this.stopped = true;
    this.queue = [];
  }

  private async _process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || this.stopped) {
      return;
    }
    this.isProcessing = true;

    const task = this.queue.shift();
    if (task) {
      await task();
      await new Promise<void>((resolve) => this.ctx.setTimeout(resolve, this.interval));
    }

    this.isProcessing = false;
    this._process();
  }
}
