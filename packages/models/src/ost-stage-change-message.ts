import { IRequestChangeOfTrialStage } from 'test-bed-schemas';

/**
 * Message to request a change of stage in the Observer Support Tool (OST),
 * so the observers get a new set of questions.
 */
export interface IOstStageChangeMessage extends IRequestChangeOfTrialStage {
  /** Should be the same ID as the inject.id */
  id: string;
}
