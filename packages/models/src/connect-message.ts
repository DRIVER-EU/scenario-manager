import { ITimeMessage, ISessionMgmt } from '.';

/** Message that is sent when connecting to Kafka */
export interface IConnectMessage {
  /** Connected to a Test-bed */
  isConnected: boolean;
  /** Current fictive time */
  time: ITimeMessage;
  /** Active session */
  session: ISessionMgmt;
  /** Kafka host name */
  host: string;
}
