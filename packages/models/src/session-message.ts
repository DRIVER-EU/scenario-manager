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
  state?: TimeState;
  comment?: string;
}

export enum SessionState {
  START = 'START',
  STOP = 'STOP',
}

/** Inform participants about the current session */
export interface ITestbedSessionMessage {
  trialId: string;
  trialName: string;
  scenarioId: string;
  scenarioName: string;
  sessionId: string;
  sessionName: string;
  sessionState: SessionState;
  comment?: string;
}

/** Convert a ISessionMessage, as used in the Trial Manager, to a Test-bed ITestbedSessionMessage */
export const sessionMessageToTestbed = (sm: ISessionMessage, trialName: string, scenarioName: string) => ({
  ...sm,
  trialName,
  scenarioName,
  sessionState: sm.state === TimeState.Started ? SessionState.START : SessionState.STOP,
});
