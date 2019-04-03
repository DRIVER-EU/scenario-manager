import { IContent, MessageType } from '.';

/** The inject state communicates the state of an inject during execution of a scenario. */
export enum InjectState {
  /** Waiting to be scheduled for execution */
  ON_HOLD = 'ON_HOLD',
  /** Scheduled for execution */
  SCHEDULED = 'SCHEDULED',
  /** Being executed, e.g. a role player has started his act, but did not finish yet. */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Inject has finished, is completed */
  EXECUTED = 'EXECUTED',
  /** Do not execute it anymore */
  CANCELLED = 'CANCELLED',
}

export enum InjectType {
  INJECT = 'INJECT',
  ACT = 'ACT',
  STORYLINE = 'STORYLINE',
  SCENARIO = 'SCENARIO',
}

export enum InjectConditionType {
  UNKNOWN = 'UNKNOWN',
  /** Delay for a certain amount of time */
  DELAY = 'DELAY',
  /** Delay for 0 seconds */
  IMMEDIATELY = 'IMMEDIATELY',
  /** Delay based on the scenario start time */
  AT_TIME = 'AT_TIME',
  /** Wait for manual confirmation to start */
  MANUALLY = 'MANUALLY',
}

export type UnitType = 'seconds' | 'minutes' | 'hours';

export interface IInjectCondition {
  /** Type of delay that rules this condition */
  type?: InjectConditionType;
  /** When the delay type is a DELAY, i.e. a timespan, specifies the units */
  delay?: number;
  /** When the delay type is a DELAY, i.e. a timespan, specifies the unit type */
  delayUnitType?: UnitType;
  /** ID of the inject you depend upon */
  injectId?: string;
  /** State of the inject you depend upon */
  injectState?: InjectState;
}

export interface IInject extends IContent {
  /** Who performs the action */
  actorId?: string;
  /** Who is the recipient/receiver of the action/message */
  recipientId?: string;
  // TODO Convert to array
  /** Conditions that will start this inject */
  condition?: IInjectCondition;
  /** Is it a storyline, act or inject */
  type: InjectType;
  /** What kind of message are we sending */
  messageType?: MessageType;
  /** Inject message */
  message?: {
    /** Key is the the same as the InjectType */
    [key: string]: unknown;
  };
}

export interface IInjectGroup extends IInject {
  mainObjectiveId?: string;
  secondaryObjectiveId?: string;
}

export interface IScenario extends IInjectGroup {
  /** When does the scenario start */
  startDate?: string;
  /** When does the scenario end */
  endDate?: string;
}
