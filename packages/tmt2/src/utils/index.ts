export * from './utils';
export * from './trial-helpers';
import { UIForm, IInputField, padLeft } from 'mithril-ui-form';

/**
 * Create a GUID
 * @see https://stackoverflow.com/a/2117523/319711
 *
 * @returns RFC4122 version 4 compliant GUID
 */
export const uuid4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // tslint:disable-next-line:no-bitwise
    const r = (Math.random() * 16) | 0;
    // tslint:disable-next-line:no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Create a unique ID
 * @see https://stackoverflow.com/a/2117523/319711
 *
 * @returns RFC4122 version 4 compliant GUID
 */
export const uniqueId = () => {
  return 'id_xxxxxxxxxx'.replace(/[xy]/g, () => {
    // tslint:disable-next-line:no-bitwise
    const r = (Math.random() * 16) | 0;
    // tslint:disable-next-line:no-bitwise
    return r.toString(16);
  });
};

export const capitalizeFirstLetter = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export const toLetters = (num: number): string => {
  const mod = num % 26;
  // tslint:disable-next-line:no-bitwise
  let pow = (num / 26) | 0;
  const out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? toLetters(pow) + out : out;
};

/**
 * Generate a sequence of numbers between from and to with step size: [from, to].
 *
 * @static
 * @param {number} from
 * @param {number} to : inclusive
 * @param {number} [count=to-from+1]
 * @param {number} [step=1]
 * @returns
 */
export const range = (from: number, to: number, count: number = to - from + 1, step: number = 1) => {
  // See here: http://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n
  // let a = Array.apply(null, {length: n}).map(Function.call, Math.random);
  const a: number[] = new Array(count);
  const min = from;
  const max = to - (count - 1) * step;
  const theRange = max - min;
  const x0 = Math.round(from + theRange * Math.random());
  for (let i = 0; i < count; i++) {
    a[i] = x0 + i * step;
  }
  return a;
};

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
export const shuffle = (a: Array<any>) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Convert strings like XmlHTTPRequest to Xml HTTP Request
 * @see https://stackoverflow.com/a/6229124/319711
 */
export const unCamelCase = (str?: string) =>
  str
    ? str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // insert a space between lower & upper
        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3') // space before last upper in a sequence followed by lower
        .replace(/^./, (char) => char.toUpperCase()) // uppercase the first character
    : '';

export const deepEqual = <T extends { [key: string]: any }>(x?: T, y?: T): boolean => {
  const tx = typeof x;
  const ty = typeof y;
  return x && y && tx === 'object' && tx === ty
    ? Object.keys(x).length === Object.keys(y).length && Object.keys(x).every((key) => deepEqual(x[key], y[key]))
    : x === y;
};

/** Remove paragraphs <p> and </p> and the beginning and end of a string. */
export const removeParagraphs = (s: string) => s.replace(/<\/?p>/g, '');

export const removeHtml = (s: string) => s.replace(/<\/?[0-9a-zA-Z=\[\]_ \-"]+>/gm, '').replace(/&quot;/gi, '"');

/**
 * Join a list of items with a comma.
 * Removes empty items, and optionally adds brackets around the comma separated list.
 */
export const formatOptional = (
  options: { brackets?: boolean; prepend?: string; append?: string },
  ...items: Array<string | number | undefined>
) => {
  const { brackets, prepend = '', append = '' } = options;
  const f = items.filter((i) => typeof i !== 'undefined' && i !== '');
  if (!f || f.length === 0) {
    return '';
  }
  const txt = `${prepend}${f.join(', ')}${append}`;
  return f.length === 0 ? '' : brackets ? ` (${txt})` : txt;
};

export const debounce = (func: (...args: any) => void, timeout: number) => {
  let timer: number;
  return (...args: any) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      func(...args);
    }, timeout);
  };
};

export const formatTimestamp = (time?: Date | string, showSeconds = true) => {
  if (!time) {
    return '';
  }
  const t = new Date(time);
  return `${padLeft(t.getHours())}:${padLeft(t.getMinutes())}${showSeconds ? `:${padLeft(t.getSeconds())}` : ''}`;
};

/**
 * Create a resolver that translates an ID and value (or values) to a human readable representation
 * by replacing the keys with their form labels, making it easier to render the object into a human
 * readable form.
 */
export const labelResolver = (form: UIForm) => {
  const createDict = (ff: IInputField[], label = '') => {
    const d = ff
      .filter((f) => f.type !== 'section' && f.type !== 'md')
      .reduce((acc, cur) => {
        const fieldId = (label ? `${label}.` : '') + cur.id;
        const type = cur.type || (cur.options && cur.options.length > 0 ? 'select' : 'text');
        if (typeof type === 'string') {
          acc[fieldId] = cur;
        } else {
          acc = { ...acc, ...createDict(type, fieldId) };
        }
        return acc;
      }, {} as { [key: string]: IInputField });
    return d;
  };

  const dict = createDict(form);

  const resolver = (id: string, value?: number | string | string[]) => {
    if (!dict.hasOwnProperty(id) || typeof value === 'undefined') {
      return value;
    }
    const ff = dict[id];
    const values = value instanceof Array ? value.filter((v) => v !== null && v !== undefined) : [value];
    const type = ff.type || (ff.options ? 'options' : 'none');
    switch (type) {
      default:
        return value;
      case 'radio':
      case 'select':
      case 'options':
        return values
          .map((v) =>
            ff
              .options!.filter((o) => o.id === v)
              .map((o) => o.label || capitalizeFirstLetter(o.id))
              .shift()
          )
          .filter((v) => typeof v !== 'undefined');
    }
  };

  /** Resolve an object by replacing all keys with their label counterpart. */
  const resolveObj = <T>(obj: any, parent = ''): T | undefined => {
    if (!obj || (typeof obj === 'object' && Object.keys(obj).length === 0)) {
      return undefined;
    }
    if (obj instanceof Array) {
      return obj.map((o) => resolveObj(o, parent)) as any;
    } else {
      const resolved = {} as { [key: string]: any };
      Object.keys(obj).forEach((key) => {
        const fullKey = parent ? `${parent}.${key}` : key;
        const value = obj[key as keyof T];
        if (typeof value === 'boolean') {
          resolved[key] = value;
        } else if (typeof value === 'number' || typeof value === 'string') {
          const r = resolver(fullKey, value);
          if (r) {
            resolved[key] = r instanceof Array && r.length === 1 ? r[0] : r;
          }
        } else if (value instanceof Array) {
          if (typeof value[0] === 'string' || value[0] === null) {
            const r = resolver(fullKey, value);
            if (r) {
              resolved[key] = r;
            }
          } else {
            resolved[key] = resolveObj(value, key);
          }
        } else if (typeof value === 'object') {
          resolved[key] = value;
        }
      });
      return resolved as T;
    }
  };

  return resolveObj;
};

/** Print a list, removing empty items: a, b and c */
export const l = (val: undefined | string | Array<string | boolean | undefined>, and = 'en') => {
  if (!val) {
    return '';
  }
  if (val instanceof Array) {
    const v = val.filter(Boolean);
    if (v.length === 1) {
      return v[0];
    }
    const [last, oneButLast, ...items] = v.reverse();
    return [...items, `${oneButLast} ${and} ${last}`].filter(Boolean).join(', ');
  } else {
    return val;
  }
};

export const mediaOptions = [
  { id: '.gif' },
  { id: '.jpg' },
  { id: '.jpeg' },
  { id: '.png' },
  { id: '.svg' },
  { id: '.mp3' },
  { id: '.mp4' },
  { id: '.wmv' },
  { id: '.mkv' },
];

export const formatDate = (date: number | Date) => {
  const d = new Date(date);
  const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'okt', 'nov', 'dec'];
  return `${d.getDate()} ${months[d.getMonth() - 1]}`;
};
