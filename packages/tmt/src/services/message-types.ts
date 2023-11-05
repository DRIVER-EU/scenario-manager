import { IKafkaMessage, MessageType } from 'trial-manager-models';

export const selectedMessageTypes = [
  {
    id: MessageType.ROLE_PLAYER_MESSAGE,
    name: 'Send role player message',
    iconName: 'person',
    templateId: MessageType.ROLE_PLAYER_MESSAGE,
    messageType: MessageType.ROLE_PLAYER_MESSAGE,
    kafkaTopic: 'system_tm_role_player',
    useNamespace: false,
    useCustomGUI: false,
  },
  {
    id: MessageType.REQUEST_UNIT_MOVE,
    name: 'Move a resource along a road',
    iconName: 'directions_car',
    templateId: MessageType.REQUEST_UNIT_MOVE,
    messageType: MessageType.REQUEST_UNIT_MOVE,
    kafkaTopic: 'simulation_request_move',
    useNamespace: false,
    useCustomGUI: false,
  },
  {
    id: MessageType.GEOJSON_MESSAGE,
    name: 'Send a GeoJSON map layer',
    iconName: 'map',
    templateId: MessageType.GEOJSON_MESSAGE,
    messageType: MessageType.GEOJSON_MESSAGE,
    kafkaTopic: 'standard_geojson',
    useNamespace: true,
    namespace: 'eu.driver.model.geojson',
    useCustomGUI: false,
  },
] as IKafkaMessage[];
