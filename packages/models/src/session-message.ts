import { TimeState } from './time-state';

// /** Status of the TMT */
// export enum ExecutionStatus {
//   /** No scenario loaded */
//   IDLE = 'IDLE',
//   /** Scenario loaded, session started, nothing is happening */
//   INITIALIZED = 'INITIALIZED',
//   /** Scenario is started, i.e. the time is started */
//   STARTED = 'STARTED',
//   /** Scenario is stopped, i.e. the time is stopped */
//   STOPPED = 'STOPPED',
// }

/** Inform participants about the current session */
export interface ISessionMessage {
  id: number;
  name: string;
  trialId: string;
  scenarioId: string;
  status?: TimeState;
  comment?: string;
}
