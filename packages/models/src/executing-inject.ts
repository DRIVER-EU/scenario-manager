import { IInject, InjectState } from './inject';

/** Inject that is actively running in a scenario, combining IInject and IStateUpdate information. */
export interface IExecutingInject extends IInject {
  state: InjectState;
  lastTransitionAt: Date;
  expectedExecutionTimeAt?: Date;
}
