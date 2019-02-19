export enum TrialPhase {
  PROPER_NAME = 1,
  INITIALIZATION,
  PREPARATION,
  PRE_INCIDENT,
  INCIDENT,
  POST_INCIDENT,
}

/** To indicate to all subscribers that we are entering a new phase of the Trial. */
export interface IPhaseMessage {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Phase of the Trial */
  phase: TrialPhase;
  /** If the phase is starting or ending */
  isStarting?: boolean;
  /** In case you want to use an alternative name for your phase */
  alternativeName?: string;
}
