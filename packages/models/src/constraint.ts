import { IInject } from './inject';

export enum ConstraintType {
  MANUAL,
  ABSOLUTE_TIME,
  RELATIVE_TIME,
  ON_STORYLINE_START,
  ON_STORYLINE_END,
  ON_ACT_START,
  ON_ACT_END,
  ON_INJECT_START,
  ON_INJECT_END,
  ON_EVENT,
}

export interface IConstraint {
  id: string;
  type: ConstraintType;
  /**
   * Time delay in msec, either based on the scenario start time
   * (when using ABSOLUTE_TIME), or on a relative time after a
   * previous inject or storyline.
   */
  delay: number;
  dependsOn?: IInject;
  eventName?: string;
}
