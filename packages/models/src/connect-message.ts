import { ITimeManagement, ISessionManagement } from 'test-bed-schemas';

/** Message that is sent when connecting to Kafka */
export interface IConnectMessage {
  /** Connected to a Test-bed */
  isConnected: boolean;
  /** Current fictive time */
  time: ITimeManagement;
  /** Active session */
  session: ISessionManagement;
  /** Kafka host name */
  host: string;
}
