import { InjectState } from '.';

export interface IInjectSimStates {
  [id: string]: IInjectSimState;
}

export interface IInjectSimState {
  state: InjectState;
  lastTransitionAt: Date;
  title?: string;
}
