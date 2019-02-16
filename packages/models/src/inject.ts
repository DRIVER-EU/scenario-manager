import { IContent } from '.';

export enum MessageType {
  ROLE_PLAYER_MESSAGE,
  PHASE_MESSAGE,
  POST_MESSAGE,
  GEOJSON_MESSAGE,
  AUTOMATED_ACTION,
  // PARTICIPANT_MESSAGE = 'PARTICIPANT_MESSAGE',
  // OBSERVER_MESSAGE = 'OBSERVER_MESSAGE',
  // OPERATOR_MESSAGE = 'OPERATOR_MESSAGE',
  // AUTOMATED_ACTION = 'AUTOMATED_ACTION',
  // BRANCH = 'BRANCH',
  // WAIT_FOR_OPERATOR_INPUT = 'WAIT_FOR_OPERATOR_INPUT',
}

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
  UNKNOWN,
  /** Delay for a certain amount of time */
  DELAY,
  /** Delay for 0 seconds */
  IMMEDIATELY,
  /** Delay based on the scenario start time */
  AT_TIME,
  /** Wait for manual confirmation to start */
  MANUALLY,
}

export type UnitType = 'seconds' | 'minutes' | 'hours';

export interface IInjectCondition {
  /** Type of delay that rules this condition */
  type?: InjectConditionType;
  /** When the delay type is a DELAY, i.e. a timespan, specifies the units */
  delay?: number;
  /** When the delay type is a DELAY, i.e. a timespan, specifies the unit type */
  delayUnitType?: UnitType;
  /**
   * By default, for injects, the conditions is based on the previous inject.
   * However, it may also depend on the start or finish of another act, storyline or scenario.
   */
  injectLevel?: InjectType;
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
  /** Only relevant when executing, declares the state of the inject */
  state?: InjectState;
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
  startDate?: Date;
  /** When does the scenario end */
  endDate?: Date;
}
