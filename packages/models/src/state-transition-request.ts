import { InjectState } from './inject';

export interface IStateTransitionRequest {
  id: string;
  from: InjectState;
  to: InjectState;
  /** Time of the expected execution (Date.valueOf()) */
  expectedExecutionTimeAt?: number;
  comment?: string;
}
