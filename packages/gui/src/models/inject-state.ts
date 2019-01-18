/** The inject state communicates the state of an inject during execution of a scenario. */
export enum InjectState {
  /** Waiting to be scheduled for execution */
  ON_HOLD = 'ON_HOLD',
  /** Scheduled for execution */
  SCHEDULED = 'SCHEDULED',
  /** Being executed, e.g. a role player has started his act, but did not finish yet. */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Inject has finished, is completed */
  EXECUTED = 'EXECUTED',
  /** Do not execute it anymore */
  CANCELLED = 'CANCELLED',
}
