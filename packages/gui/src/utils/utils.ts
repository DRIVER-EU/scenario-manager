import {
  IContent,
  InjectType,
  IInject,
  MessageType,
  getParent,
  IPerson,
  UserRole,
  IAsset,
  InjectState,
  InjectConditionType,
  RolePlayerMessageType,
  IInjectGroup,
} from 'trial-manager-models';
import { TrialSvc } from '../services';
import { IExecutingInject } from '../models';
import { LatLngExpression } from 'leaflet';

/** Iterate over an enum: note that for non-string enums, first the number and then the values are iterated */
export const iterEnum = <E extends { [P in keyof E]: number | string }>(e: E) =>
  Object.keys(e)
    .filter((v, i, arr) => i < arr.length / 2)
    .map(k => +k);

/** Map a string enum to a list of options */
export const enumToOptions = <E extends { [P in keyof E]: string }>(e: E) =>
  Object.keys(e).map(id => ({ id, label: id }));

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

/**
 * Represent the message with an icon.
 * @param type message type
 */
export const getMessageIcon = (type?: string) => {
  switch (type) {
    case MessageType.GEOJSON_MESSAGE:
      return 'map';
    case MessageType.CAP_MESSAGE:
      return 'add_alert';
    case MessageType.PHASE_MESSAGE:
      return 'flag'; // 'chat';
    case MessageType.ROLE_PLAYER_MESSAGE:
      return 'record_voice_over';
    case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
      return 'speaker_notes';
    case MessageType.LCMS_MESSAGE:
      return 'event_seat';
    case MessageType.START_INJECT:
      return 'colorize';
    case MessageType.REQUEST_UNIT_TRANSPORT:
      return 'directions';
    case MessageType.SET_AFFECTED_AREA:
      return 'wallpaper';
    case MessageType.SUMO_CONFIGURATION:
      return 'traffic';
    case MessageType.CHECKPOINT:
      return 'check';
    default:
      return 'message';
  }
};

/**
 * Represent the role player message with an icon.
 * @param type message type
 */
export const getRolePlayerMessageIcon = (type?: RolePlayerMessageType) => {
  switch (type) {
    case RolePlayerMessageType.MAIL:
      return 'email';
    case RolePlayerMessageType.CALL:
      return 'phone'; // 'chat';
    case RolePlayerMessageType.ACTION:
      return 'directions_run';
    case RolePlayerMessageType.TWEET:
      return 'message';
    default:
      return 'message';
  }
};

/**
 * Represent the message with a title.
 * @param type message type
 */
export const getMessageTitle = (type?: string) => {
  switch (type) {
    case MessageType.GEOJSON_MESSAGE:
      return 'MAP OVERLAY';
    case MessageType.CAP_MESSAGE:
      return 'COMMON ALERTING PROTOCOL MESSAGE';
    case MessageType.PHASE_MESSAGE:
      return 'NEW PHASE';
    case MessageType.POST_MESSAGE:
      return 'POST A MESSAGE';
    case MessageType.ROLE_PLAYER_MESSAGE:
      return 'ROLE PLAYER MESSAGE';
    case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
      return 'CHANGE OBSERVER QUESTIONNAIRES';
    // case MessageType.AUTOMATED_ACTION:
    //   return 'AUTOMATED ACTION';
    case MessageType.LCMS_MESSAGE:
      return 'LCMS MESSAGE';
    case MessageType.START_INJECT:
      return 'START INJECT';
    case MessageType.REQUEST_UNIT_TRANSPORT:
      return 'REQUEST UNIT TRANSPORT';
    case MessageType.SET_AFFECTED_AREA:
      return 'SET AFFECTED AREA';
    case MessageType.SUMO_CONFIGURATION:
      return 'SUMO CONFIGURATION';
    case MessageType.CHECKPOINT:
      return 'CHECKPOINT';
    default:
      return 'message';
  }
};

/** Get the icon for an inject, either a scenario/storyline/act icon, or a message icon */
export const getIcon = (inject: IInject) =>
  inject.type === InjectType.INJECT ? getMessageIcon(inject.messageType) : getInjectIcon(inject.type);

/** Get the icon representing the execution state */
export const executionIcon = (inject: IExecutingInject) => {
  switch (inject.state) {
    case InjectState.EXECUTED:
      return 'check';
    case InjectState.SCHEDULED:
      return inject.condition && inject.condition.type === InjectConditionType.MANUALLY ? 'pause' : 'play_arrow';
    case InjectState.ON_HOLD:
      return 'pan_tool';
    case InjectState.IN_PROGRESS:
      return 'directions_run';
    default:
      return 'stop';
  }
};

export const assetIcon = (asset: IAsset) =>
  !asset.mimetype
    ? ''
    : asset.mimetype.indexOf('image/') === 0
    ? 'image'
    : asset.mimetype.indexOf('application/pdf') === 0
    ? 'picture_as_pdf'
    : asset.mimetype.indexOf('application/json') === 0
    ? 'map'
    : 'short_text';

export const userIcon = (user: IPerson) => {
  switch (user.roles[0]) {
    default:
      return 'person';
    case UserRole.EDITOR:
      return 'edit';
    case UserRole.PARTICIPANT:
      return 'face';
    case UserRole.ROLE_PLAYER:
      return 'record_voice_over';
    case UserRole.STAKEHOLDER:
      return 'attach_money';
    case UserRole.ADMIN:
      return 'supervisor_account';
  }
};

export const userRoleToString = (role: UserRole) => {
  switch (role) {
    default:
      return UserRole[role];
    case UserRole.ROLE_PLAYER:
      return 'ROLE PLAYER';
  }
};

export const userRolesToString = (user: IPerson) => {
  const { roles } = user;
  return roles.map(userRoleToString).join(', ');
};

/** Returns true if the user's roles contains the requested role */
export const userRolesFilter = (user: IPerson, role: UserRole) => {
  const { roles } = user;
  return roles.filter(r => r === role).length > 0;
};

export const eatSpaces = (ev: KeyboardEvent) => {
  if (ev.which === 32) {
    return false;
  }
};

const formatHHmm = (t: Date) => `${padLeft(t.getHours())}:${padLeft(t.getMinutes())}`;
const formatDate = (t: Date) => `${t.getDate() > 1 ? `${t.getDate() - 1}d ` : ''}`;

/** Convert a date to HH:mm, optionally including seconds and date */
export const formatTime = (t: Date, includeSeconds = true, includeDate = false) =>
  includeSeconds
    ? `${includeDate ? formatDate(t) : ''}${formatHHmm(t)}:${padLeft(t.getSeconds())}`
    : `${includeDate ? formatDate(t) : ''}${formatHHmm(t)}`;

/**
 * For injects, find injects in the same act that have been executed earlier, including the parent act itself.
 * For acts, find other acts in the same storyline that have been executed earlier, including the parent storyline.
 * For storylines, find other storylines in the same scenario that have been executed earlier, including the scenario.
 */
export const findPreviousInjects = (inject?: IInject, injects?: IInject[]) => {
  if (!injects || !inject) {
    return [];
  }
  const olderSiblings = (id: string) => {
    let found = false;
    return injects
      .filter(i => i.parentId === id)
      .filter(i => {
        found = i.id === inject.id;
        return !found;
      });
  };
  const type =
    inject.type === InjectType.INJECT
      ? InjectType.ACT
      : inject.type === InjectType.ACT
      ? InjectType.STORYLINE
      : InjectType.SCENARIO;
  const parent = getParent(injects, inject.id || inject.parentId, type);
  if (!parent) {
    return [];
  }
  return [parent, ...olderSiblings(parent.id)];
};

/**
 * Most messages must be published to Kafka, perhaps in different topics.
 * A direct relationship from message to topic is restrictive, and difficult to manage.
 * Therefore, we publish to a subject, which is linked to a topic.
 */
export const getMessageSubjects = (mt: MessageType) => {
  const trial = TrialSvc.getCurrent();
  const messageTopics = trial.messageTopics || [];
  const messageTopic = messageTopics.filter(t => t.messageType === mt).shift();
  return messageTopic ? messageTopic.topics.map(t => ({ id: t.id, label: t.subject })) : [];
};

/** Create an email link */
export const createEmailLink = (emails: string | Array<string | undefined>, subject?: string, body?: string) => {
  const addresses = emails instanceof Array ? emails.join(',') : emails;
  return `mailto:${addresses}${subject || body ? '?' : ''}${subject ? `subject=${subject}` : ''}${
    subject && body ? '&' : ''
  }${body ? `body=${body}` : ''}`;
};

/**
 * Create a phone call link
 * @param phone Phone number
 */
export const createPhoneLink = (phone?: string) => (phone ? `tel:${phone}` : '');

/** Debounce a function */
export const debounce = <F extends (...params: any[]) => void>(fn: F, delay = 100) => {
  let timeoutID: number;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutID);
    timeoutID = window.setTimeout(() => fn.apply(this, args), delay);
  } as F;
};

/** Get the center and zoom for a GeoJSON */
export const centerArea = (area: L.GeoJSON<any>) => {
  const bounds = area.getBounds();
  return Object.keys(bounds).length
    ? {
        view: bounds.getCenter(),
        zoom: 14,
      }
    : {
        view: [51.5, 5] as LatLngExpression,
        zoom: 4,
      };
};

/** Test if the filename represents a GeoJSON (based on the extension) */
export const isJSON = (s: string) => /\.json$|\.geojson$/.test(s);

/** Type guard check if we are dealing with an inject group  */
export const isInjectGroup = (i: IInject): i is IInjectGroup => i.type !== InjectType.INJECT;
