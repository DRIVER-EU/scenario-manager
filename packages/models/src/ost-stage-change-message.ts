/**
 * Message to request a change of stage in the Observer Support Tool (OST),
 * so the observers get a new set of questions.
 */
export interface IOstStageChangeMessage {
  /** The unique identifier of the running Trial. */
  ostTrialId?: number;
  /** The sessionId for the running Trial. */
  ostTrialSessionId: number;
  /** The stageId of the stage that should be activated. */
  ostTrialStageId: number;
}
