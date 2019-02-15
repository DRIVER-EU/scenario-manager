import { IContent, InjectType, IInject, MessageType, getParent } from 'trial-manager-models';

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

/** Iterate over an enum: note that for non-string enums, first the number and then the values are iterated */
export const iterEnum = <E extends { [P in keyof E]: number | string }>(e: E) =>
  Object.keys(e)
    .filter((v, i, arr) => i < arr.length / 2)
    .map(k => +k);

/**
 * Convert an item array to a tree. Assumes each item has a parentId.
 * @param items Items
 */
export const unflatten = <T extends { id?: string; parentId?: string }>(
  entities: T[] = [],
  parent = { id: undefined } as { id?: string; children?: T[] },
  tree = [] as Array<T & { children: T[] }>
) => {
  const children = (parent.id
    ? entities.filter(entity => entity.parentId === parent.id)
    : entities.filter(entity => !entity.parentId)) as Array<T & { children: T[] }>;

  if (children.length > 0) {
    if (!parent.id) {
      tree = children;
    } else {
      parent.children = children;
    }
    children.forEach(child => unflatten(entities, child));
  }

  return tree;
};

/**
 * Pad left, default width 2 with a '0'
 *
 * @see http://stackoverflow.com/a/10073788/319711
 * @param {(string | number)} n
 * @param {number} [width=2]
 * @param {string} [z='0']
 * @returns
 */
export const padLeft = (n: string | number, width = 2, z = '0') => {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

/**
 * Function to filter case-insensitive title and description.
 * @param filterValue Filter text
 */
export const titleAndDescriptionFilter = (filterValue?: string) => {
  filterValue = filterValue && filterValue.toLowerCase();
  return !filterValue
    ? () => true
    : (content: IContent) =>
        (content.title && content.title.toLowerCase().indexOf(filterValue as string) >= 0) ||
        (content.description && content.description.toLowerCase().indexOf(filterValue as string) >= 0);
};

// let i = 0;
// console.log(`${++i}: ${deepEqual([1, 2, 3], [1, 2, 3])}`);
// console.log(`${++i}: ${deepEqual([1, 2, 3], [1, 2, 3, 4])}`);
// console.log(`${++i}: ${deepEqual({ a: 'foo', b: 'bar' }, { a: 'foo', b: 'bar' })}`);
// console.log(`${++i}: ${deepEqual({ a: 'foo', b: 'bar' }, { b: 'bar', a: 'foo' })}`);

/**
 * Represent the inject with an icon.
 * @param type inject type
 */
export const getInjectIcon = (type?: InjectType) => {
  switch (type) {
    case InjectType.INJECT:
      return 'message';
    case InjectType.ACT:
      return 'call_to_action'; // 'chat';
    case InjectType.STORYLINE:
      return 'art_track';
    default:
      return 'import_contacts';
  }
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

export const eatSpaces = (ev: KeyboardEvent) => {
  if (ev.key === ' ') {
    // ev.preventDefault();
    return false;
  }
  return true;
};

const formatHHmm = (t: Date) => `${padLeft(t.getUTCHours())}:${padLeft(t.getUTCMinutes())}`;
const formatDate = (t: Date) => `${t.getUTCDate() > 1 ? `${t.getUTCDate() - 1}d ` : ''}`;

/** Convert a date to HH:mm, optionally including seconds and date */
export const formatTime = (t: Date, includeSeconds = true, includeDate = false) =>
  includeSeconds
    ? `${includeDate ? formatDate(t) : ''}${formatHHmm(t)}:${padLeft(t.getUTCSeconds())}`
    : `${includeDate ? formatDate(t) : ''}${formatHHmm(t)}`;

/**
 * For injects, find injects in the same act that have been executed earlier, including the parent act itself.
 * For acts, find other acts in the same storyline that have been executed earlier, including the parent storyline.
 * For storylines, find other storylines in the same scenario that have been executed earlier, including the scenario.
 */
export const findPreviousInjects = (inject?: IInject, injects?: IInject[]) => {
  if (!injects || !inject) { return []; }
  const olderSiblings = (id: string) => {
    let found = false;
    return injects
      .filter(i => i.parentId === id)
      .filter(i => {
        found = i.id === inject.id;
        return !found;
      });
  };
  const type = inject.type === InjectType.INJECT
    ? InjectType.ACT : inject.type === InjectType.ACT
    ? InjectType.STORYLINE : InjectType.SCENARIO;
  const parent = getParent(injects, inject.id || inject.parentId, type);
  if (!parent) { return []; }
  return [parent, ...olderSiblings(parent.id)];
};
