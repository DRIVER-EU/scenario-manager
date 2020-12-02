import { ITimelineItem } from 'mithril-scenario-timeline';
import { geoJSON, LatLngExpression } from 'leaflet';
import {
  IareaPoly,
  IAsset,
  IContent,
  IExecutingInject,
  IInject,
  IInjectGroup,
  ILocation,
  InjectConditionType,
  InjectState,
  InjectType,
  IPerson,
  IScenario,
  MessageType,
  RolePlayerMessageType,
  UserRole,
  toMsec,
  IInjectSimStates,
} from '../../../models';
import { LineString, FeatureCollection, MultiPolygon, Polygon } from 'geojson';

export const baseLayers = {
  OSM: {
    url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    options: {
      minZoom: 3,
      maxZoom: 20,
      // tms: true,
      attribution: '©OpenStreetMap Contributors. Tiles courtesy of Humanitarian OpenStreetMap Team',
    },
  },
  'PDOK grijs': {
    url:
      'https://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaartgrijs/EPSG:3857/{z}/{x}/{y}.png',
    options: {
      minZoom: 3,
      maxZoom: 20,
      // tms: true,
      attribution: 'Map data: <a href="http://www.kadaster.nl">Kadaster</a>',
    },
  },
  'PDOK kleur': {
    url: 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaart/EPSG:3857/{z}/{x}/{y}.png',
    options: {
      minZoom: 3,
      maxZoom: 20,
      // tms: true,
      attribution: 'Map data: <a href="http://www.kadaster.nl">Kadaster</a>',
    },
  },
};

/** Iterate over an enum: note that for non-string enums, first the number and then the values are iterated */
export const iterEnum = <E extends { [P in keyof E]: number | string }>(e: E) =>
  Object.keys(e)
    .filter((_, i, arr) => i < arr.length / 2)
    .map((k) => +k);

/** Map a string enum to a list of options */
export const enumToOptions = <E extends { [P in keyof E]: string }>(e: E) =>
  Object.keys(e).map((id) => ({ id, label: id.replace(/_/g, ' ').toUpperCase() }));

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
    ? entities.filter((entity) => entity.parentId === parent.id)
    : entities.filter((entity) => !entity.parentId)) as Array<T & { children: T[] }>;

  if (children.length > 0) {
    if (!parent.id) {
      tree = children;
    } else {
      parent.children = children;
    }
    children.forEach((child) => unflatten(entities, child));
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
    case MessageType.POST_MESSAGE:
      return 'mail';
    case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
      return 'speaker_notes';
    case MessageType.LCMS_MESSAGE:
      return 'event_seat';
    case MessageType.START_INJECT:
      return 'colorize';
    case MessageType.LARGE_DATA_UPDATE:
      return 'link';
    case MessageType.REQUEST_UNIT_MOVE:
      return 'directions';
    case MessageType.SET_AFFECTED_AREA:
      return 'wallpaper';
    case MessageType.SUMO_CONFIGURATION:
      return 'traffic';
    case MessageType.CHECKPOINT:
      return 'playlist_add_check';
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
      return 'SEND MAP OVERLAY';
    case MessageType.CAP_MESSAGE:
      return 'SEND COMMON ALERTING PROTOCOL MESSAGE';
    case MessageType.PHASE_MESSAGE:
      return 'SET PHASE';
    case MessageType.POST_MESSAGE:
      return 'POST MESSAGE';
    case MessageType.ROLE_PLAYER_MESSAGE:
      return 'INSTRUCT ROLE PLAYER';
    case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
      return 'CHANGE OBSERVER QUESTIONNAIRES';
    case MessageType.LCMS_MESSAGE:
      return 'LCMS MESSAGE';
    case MessageType.START_INJECT:
      return 'START EVENT';
    case MessageType.LARGE_DATA_UPDATE:
      return 'SEND (DATA) LINK';
    case MessageType.REQUEST_UNIT_MOVE:
      return 'MOVE UNIT';
    case MessageType.SET_AFFECTED_AREA:
      return 'SET AFFECTED AREA';
    case MessageType.SUMO_CONFIGURATION:
      return 'CONFIGURE SUMO';
    case MessageType.CHECKPOINT:
      return 'SET CHECKPOINT';
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
  return roles.filter((r) => r === role).length > 0;
};

const formatHHmm = (t: Date) => `${padLeft(t.getHours())}:${padLeft(t.getMinutes())}`;
const formatDate = (t: Date) => `${t.getDate() > 1 ? `${t.getDate() - 1}d ` : ''}`;

/** Convert a date to HH:mm, optionally including seconds and date */
export const formatTime = (t: Date, includeSeconds = true, includeDate = false) =>
  includeSeconds
    ? `${includeDate ? formatDate(t) : ''}${formatHHmm(t)}:${padLeft(t.getSeconds())}`
    : `${includeDate ? formatDate(t) : ''}${formatHHmm(t)}`;

const msecPerMinute = 60000;
const msecPerHour = 3600000;
const msecPerDay = 24 * msecPerHour;

/** Format a msec to days, hours, min and second, e.g. 2d 05:35:12. When days is 0, it is omitted. */
export const formatMsec = (t: number) => {
  const days = Math.floor(t / msecPerDay);
  if (days > 1000) {
    return '';
  }
  t -= days * msecPerDay;
  const hours = Math.floor(t / msecPerHour);
  t -= hours * msecPerHour;
  const min = Math.floor(t / msecPerMinute);
  t -= min * msecPerMinute;
  const sec = Math.floor(t / 1000);
  return `${days > 0 ? `${days}d ` : ''}${padLeft(hours)}:${padLeft(min)}:${padLeft(sec)}`;
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
  return function (this: any, ...args: any[]) {
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

// export const centerAreas = (areas: Array<L.GeoJSON<any>>) => {
//   const b = areas.reduce(
//     (acc, area) => {
//       const ca = centerArea(area);
//       acc.views.push(ca.view);
//       acc.zooms.push(ca.zoom);
//       return acc;
//     },
//     { views: [], zooms: [] } as { views: L.LatLngExpression[]; zooms: number[] }
//   );
//   return {
//     view: b.views.reduce((acc, v, i) => {
//       const lat = i * acc[0] + v[0];
//       const lng = i * acc.lng + v.lng;
//       return { lat, lng } as L.LatLngExpression;
//     }, { lat: 0, lng: 0 } as L.LatLngExpression),
//   };
// };

/** Test if the filename represents a GeoJSON (based on the extension) */
export const isJSON = (s: string) => /\.json$|\.geojson$/i.test(s);

/** Type guard check if we are dealing with an inject group  */
export const isInjectGroup = (i: IInject): i is IInjectGroup => i.type !== InjectType.INJECT;

/** Type guard check if we are dealing with a scenario  */
export const isScenario = (i: IInject): i is IScenario => i.type === InjectType.SCENARIO;

/** Type guard check if we are dealing with a storyline  */
export const isStoryline = (i: IInject): i is IScenario => i.type === InjectType.STORYLINE;

/** Type guard check if we are dealing with an act  */
export const isAct = (i: IInject): i is IScenario => i.type === InjectType.ACT;

/** Type guard check if we are dealing with a pure inject  */
export const isInject = (i: IInject): i is IScenario => i.type === InjectType.INJECT;

/** Filter for selecting all injects that represent a GeoJSON message */
export const isGeoJSONMessage = (i: IInject) => i.messageType === MessageType.GEOJSON_MESSAGE;

/** Filter for selecting all injects that represent an affected area */
export const isAffectedArea = (i: IInject) => i.messageType === MessageType.SET_AFFECTED_AREA;

/** Filter for selecting all injects that represent a transport request */
export const isTransportRequest = (i: IInject) => i.messageType === MessageType.REQUEST_UNIT_MOVE;

/** Filter for selecting all injects that have a map */
export const containsMapOverlay = (i: IInject) =>
  i.messageType === MessageType.GEOJSON_MESSAGE ||
  i.messageType === MessageType.SET_AFFECTED_AREA ||
  i.messageType === MessageType.REQUEST_UNIT_MOVE ||
  i.messageType === MessageType.CAP_MESSAGE;

// export const getAsset = async (assetId?: number) => {
//   const assets = TrialSvc.assets;
//   const cur = assetId && assets.filter(a => a.id === assetId).shift();
//   if (cur && cur.url) {
//     const fc = await m.request<GeoJSON.FeatureCollection>(cur.url);
//     const isGeoJSON = fc && fc.features && fc.features.length > 0;
//     if (isGeoJSON) {
//       return fc;
//     }
//   }
// };

// /**
//  * Utility function to get all used map overlays in a scenario.
//  * It not only extracts them from map overlay injects, but also from CAP, Set Affected Area,
//  * and several others.
//  */
// export const getMapOverlays = (injects?: IInject[], scenario?: IScenario) => {
//   if (!injects || injects.length === 0) {
//     return;
//   }
//   const scenarioInjects = scenario ? pruneInjects(scenario, injects) : injects;
//   return scenarioInjects && scenarioInjects
//     .filter(containsMapOverlay)
//     .map(async i => {
//       switch (i.messageType) {
//         case MessageType.GEOJSON_MESSAGE:
//           const geojsonMsg = getMessage<IGeoJsonMessage>(i, MessageType.GEOJSON_MESSAGE);
//           return await getAsset(geojsonMsg.assetId);
//       }
//     });
// };

export const affectedAreaToGeoJSON = (area?: IareaPoly) => {
  const geojson: FeatureCollection<Polygon> = {
    type: 'FeatureCollection',
    features: [],
  };
  if (area && area.type && area.coordinates && area.coordinates.length > 0) {
    area.coordinates.forEach((coordinates) =>
      geojson.features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates,
        },
      })
    );
  }
  return geoJSON(geojson) as L.GeoJSON<Polygon>;
};

type GeoJSON2Area = (geojson: FeatureCollection<Polygon>) => MultiPolygon | undefined;

export const geoJSONtoAffectedArea: GeoJSON2Area = (geojson: FeatureCollection<Polygon>) =>
  !geojson.features || geojson.features.length === 0
    ? undefined
    : {
        type: 'MultiPolygon',
        coordinates: geojson.features.reduce((acc, f) => {
          acc.push(f.geometry.coordinates);
          return acc;
        }, [] as number[][][][]),
      };

export const routeToGeoJSON = (route?: ILocation[] | null) => {
  const geojson: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: [],
  };
  if (route && route.length > 0) {
    geojson.features.push({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route.reduce((acc, loc) => {
          acc.push([loc.longitude, loc.latitude, loc.altitude || 0]);
          return acc;
        }, [] as number[][]),
      },
    });
  }
  return geoJSON(geojson) as L.GeoJSON<LineString>;
};

type GeoJSON2Route = (geojson: FeatureCollection<LineString>) => ILocation[] | undefined;

export const geoJSONtoRoute: GeoJSON2Route = (geojson: FeatureCollection<LineString>): ILocation[] | undefined =>
  geojson.features.length === 0
    ? undefined
    : geojson.features[0].geometry.coordinates.map(
        (c) =>
          ({
            longitude: c[0],
            latitude: c[1],
            altitude: c[2],
          } as ILocation)
      );

export const arrayMove = <T>(arr: Array<T | undefined>, oldIndex: number, newIndex: number) => {
  if (oldIndex < 0 || newIndex < 0) {
    return;
  }
  if (newIndex >= arr.length) {
    let k = newIndex - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
  // return arr; // for testing
};

const waitingForManualConfirmation = (i: IExecutingInject) =>
  i.state === InjectState.SCHEDULED && i.condition && i.condition.type === InjectConditionType.MANUALLY;

export const injectToTimelineItemFactory = (injectStates: IInjectSimStates, treeState: { [key: string]: boolean }) => (
  i: IExecutingInject
) => {
  const { condition, id } = i;
  const isCompleted = i.state === InjectState.EXECUTED;
  const delay = injectStates && injectStates.hasOwnProperty(id) ? injectStates[id].delayInSeconds || 0 : 0;
  const condDelay = condition && condition.delay ? toMsec(condition.delay, condition.delayUnitType) / 1000 : 0;
  return {
    ...i,
    isOpen: treeState[i.id],
    completed: isCompleted ? 1 : 0,
    highlight: waitingForManualConfirmation(i),
    delay: delay + condDelay,
    dependsOn:
      condition && condition.injectId
        ? [
            {
              id: condition.injectId,
              condition: condition.injectState === InjectState.EXECUTED ? 'finished' : 'started',
            },
          ]
        : undefined,
  } as ITimelineItem & IExecutingInject & { delay: number };
};

export const messageOptions = (selectedMessageTypes: string[]) =>
  enumToOptions(MessageType)
    .filter(({ id }) => !selectedMessageTypes || selectedMessageTypes.indexOf(id) >= 0)
    .map(({ id }) => ({ id, label: getMessageTitle(id as MessageType) }));
