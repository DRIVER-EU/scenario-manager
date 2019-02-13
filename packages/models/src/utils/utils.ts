import { IInject, InjectType, UnitType } from '..';

/** Get the parent of an inject, specifying the inject level */
export const getParent = (injects: IInject[], id?: string, level = InjectType.SCENARIO): IInject | undefined => {
  if (!id) {
    return undefined;
  }
  let found = {} as IInject;
  injects.some(i => {
    if (i.id !== id) {
      return false;
    }
    found = i;
    return true;
  });
  if (found.type === level) {
    return found;
  } else {
    return getParent(injects, found.parentId, level);
  }
};

/** Find an inject by ID */
export const getInject = (id?: string, injects?: IInject[]) =>
  injects && id ? injects.filter(i => i.id === id).shift() : undefined;

/** Transform a time in SI units to msec */
export const toMsec = (u: number, si: UnitType) =>
  si === 'seconds' ? u * 1000 : si === 'minutes' ? u * 60000 : u * 3600000;

export const deepEqual = <T extends { [key: string]: any }>(x?: T, y?: T): boolean => {
  const tx = typeof x;
  const ty = typeof y;
  return x instanceof Date && y instanceof Date
    ? x.getTime() === y.getTime()
    : x && y && tx === 'object' && tx === ty
    ? Object.keys(x).length === Object.keys(y).length && Object.keys(x).every(key => deepEqual(x[key], y[key]))
    : x === y;
};

/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export const deepCopy = <T>(target: T): T => {
  if (target === null) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach(v => {
      cp.push(v);
    });
    return cp.map((n: any) => deepCopy<any>(n)) as any;
  }
  if (typeof target === 'object' && target !== {}) {
    const cp = { ...(target as { [key: string]: any }) } as {
      [key: string]: any;
    };
    Object.keys(cp).forEach(k => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
};
