import { ITimeMessage } from '.';

/** Message that is sent when connecting to Kafka */
export interface IConnectMessage {
  isConnected: boolean;
  time: ITimeMessage;
}
