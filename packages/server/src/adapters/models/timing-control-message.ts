export interface ITimingControlMessage {
  /**
   * The date and time the distribution message was sent as the number of milliseconds
   * from the unix epoch, 1 January 1970 00:00:00.000 UTC.
   */
  /** The Trialtime speed factor */
  trialSpeed?: number;
  /** The type of timing control command */
  command: TimingControlCommand;
}

export enum TimingControlCommand {
  Init = 'Init',
  Start = 'Start',
  Pause = 'Pause',
  Update = 'Update',
  Stop = 'Stop',
  Reset = 'Reset',
}
