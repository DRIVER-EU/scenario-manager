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
] as IKafkaMessage[];
