import { IInject, InjectType, UnitType, MessageType, ICAPAlert } from '..';
import { FeatureCollection } from 'geojson';

/**
 * Create a unique ID
 * @see https://stackoverflow.com/a/2117523/319711
 *
 * @returns id followed by 8 hexadecimal characters.
 */
export const uniqueId = () => {
  // tslint:disable-next-line:no-bitwise
  return 'id_xxxxxxxx'.replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16));
};

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

/** Gets and optionally creates the inject message */
export const getMessage = (inject: IInject, type: MessageType) => {
  const key = MessageType[type];
  if (!inject.message || !inject.message.hasOwnProperty(key)) {
    inject.message = {};
    inject.message[key] = { id: inject.id };
  }
  return inject.message[key] as { id: string; [key: string]: unknown };
};

export const isInt = (n: number | string | boolean) => Number(n) === n && n % 1 === 0;

export const isFloat = (n: number | string | boolean) => Number(n) === n && n % 1 !== 0;

/** Convert a GeoJSON to an AVRO representation */
export const geojsonToAvro = (geojson?: FeatureCollection) => {
  if (!geojson) {
    return;
  }
  const avro = { type: 'FeatureCollection' } as { [key: string]: any };
  if (geojson.bbox) {
    avro.bbox = geojson.bbox.map(b => b);
  }
  if (geojson.features) {
    avro.features = geojson.features.map(f => {
      const avroFeature = {} as { [key: string]: any };
      if (f && f.geometry && Object.keys(f.geometry).length > 1) {
        avroFeature.geometry = {
          [`eu.driver.model.geojson.${f.geometry.type}`]: deepCopy(f.geometry),
        } as { [key: string]: any };
      }
      avroFeature.properties = mapToAvro(f.properties);
      return avroFeature;
    });
  }
  return avro;
};

/** Convert a flat object to an AVRO representation, where all numbers will either be int or double. */
export const mapToAvro = (props: { [key: string]: any } | null) => {
  if (props && Object.keys(props).length > 0) {
    return Object.keys(props).reduce(
      (acc, key) => {
        const val = props[key];
        acc[key] = {} as { [key: string]: any };
        if (typeof val === 'object') {
          acc[key].string = JSON.stringify(val);
        } else if (typeof val === 'number') {
          acc[key][isInt(val) ? 'int' : 'double'] = val;
        } else {
          acc[key][typeof val] = val;
        }
        return acc;
      },
      {} as { [key: string]: any }
    );
  }
};
