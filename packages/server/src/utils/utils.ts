import { RunResult } from 'sqlite3';

export const logError = (err?: Error) => {
  if (err) {
    console.error(err.message);
  }
};

/** Wrap the result callback */
export const dbCallbackWrapper = (
  resolve: (value?: number | PromiseLike<number>) => void,
  reject: (reason?: any) => void,
) => {
  return function dbCallback(this: RunResult, err: Error | null) {
    if (err) {
      return reject(err.message);
    }
    resolve(this.lastID);
  };
};
