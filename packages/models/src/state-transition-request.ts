import { InjectState } from './inject';

export interface IStateTransitionRequest {
  id: string;
  from: InjectState;
  to: InjectState;
}
