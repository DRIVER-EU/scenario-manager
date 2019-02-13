import { InjectState } from '.';

export interface IStateUpdate {
  state: InjectState;
  lastTransitionAt: Date;
}
