/**
 * Message to request a change of stage in the Observer Support Tool (OST),
 * so the observers get a new set of questions.
 */
export interface IOstStageChangeMessage extends ITestbedOstStageChangeMessage {
  /** Should be the same ID as the inject.id */
  id: string;
}

/**
 * Message to request a change of stage in the Observer Support Tool (OST),
 * so the observers get a new set of questions.
 */
export interface ITestbedOstStageChangeMessage {
  /** The unique identifier of the running Trial. */
  ostTrialId?: number;
  /** The sessionId for the running Trial. */
  ostTrialSessionId: number;
  /** The stageId of the stage that should be activated. */
  ostTrialStageId: number;
}

