import { RunResult } from 'sqlite3';
import { marked } from 'marked';

marked.setOptions({
  renderer: new marked.Renderer(),
  // highlight: (code) => require('highlight.js').highlightAuto(code).value,
  pedantic: false,
  gfm: true,
  breaks: true,
});

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

/**
 * Parse markdown
 *
 * Simple helper function to enable others to also use the markdown parser inside their own code,
 * without the need to require it again.
 */
export const parse = (markdown: string) => marked(markdown);
