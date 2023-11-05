// export * from './timing-control-message.js';
export * from './asset.js';
export * from './connect-message.js';
export * from './content.js';
export * from './entity-post-message.js';
export * from './executing-inject.js';
export * from './execution-service.js';
export * from './geojson-message.js';
export * from './inject-sim-state.js';
export * from './inject.js';
export * from './location.js';
export * from './message-topic.js';
export * from './message-type.js';
export * from './object-of-interest.js';
export * from './objective.js';
export * from './ost-stage-change-message.js';
export * from './person-of-interest.js';
export * from './person.js';
export * from './resource.js';
export * from './role-player-message.js';
export * from './session-message.js';
export * from './sim-state.js';
export * from './stakeholder.js';
export * from './state-transition-request.js';
export * from './todo.js';
export * from './trial.js';
export * from './user-role.js';
export * from './utils/index.js';
export * from './gui-template.js';
export * from './send_file-message.js';
export * from './send_message-message.js';
export * from './info-message.js';
export {
  ILargeDataUpdate,
  DataType,
  IAlert,
  Status,
  IInfo,
  MsgType,
  Scope,
  Category,
  Urgency,
  Severity,
  Certainty,
  IValueNamePair,
  ResponseType,
  IPhaseMessage,
  Phase,
  IRequestMove,
  Type as RolePlayerMessageType,
  IAffectedArea,
  IRequestStartInject,
  ISumoConfiguration,
  IareaPoly,
  ILocation,
  ISessionManagement,
  SessionState,
  TimeState,
  ITimeManagement,
  ITimeControl,
  TimeCommand,
  IFeatureCollection,
  ILineString,
  IPolygon,
  IPoint,
  IMultiLineString,
  IMultiPoint,
  IMultiPolygon,
} from 'test-bed-schemas';
/**
 * Straight – move in a direct line to all waypoints without taking into account
 * the terrain; CrossCountry – move directly to all waypoints without taking into
 * account the roads; OnlyRoads – stay on the roads to get to the closest point
 * to the waypoints that is still on a road; RoadsAndCrossCountry – move to the
 * waypoints by taking into account the roads; it is allowed to go off the road
 */
export enum MoveType {
  Straight = "Straight",
  CrossCountry = "CrossCountry",
  OnlyRoads = "OnlyRoads",
  RoadsAndCrossCountry = "RoadsAndCrossCountry"
}