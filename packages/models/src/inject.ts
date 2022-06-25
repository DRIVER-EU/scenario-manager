import { IContent, ITodo } from '.';
import { IKafkaMessage } from './trial';

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
  /** Optionally, for manual conditions, identify the one responsible for it. */
  rolePlayerId?: string;
}

export type InjectValidationState = 'valid' | 'invalid' | 'childInvalid';

export type InjectKeys = keyof IScenario | Array<keyof IScenario>;

export interface IInject extends IContent {
  /** Conditions that will start this inject */
  condition?: IInjectCondition;
  /** Is it a storyline, act or inject */
  type: InjectType;
  /** Topic for the inject */
  topic?: string;
  /** Type of message: is used to extract the relevant message content */
  messageType?: string;
  /** Inject message */
  message?: {
    /** Key is the the same as the topic */
    [messageType: string]: unknown;
  };
  /** Inject validation state */
  isValid?: InjectValidationState;
  /** Optional kafka topic that overwrites other kafka topics */
  kafkaTopic?: string;
  topicId?: string;
  selectedMessage?: IKafkaMessage
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
  /** Checklist: items to do before the scenario has started */
  todoBefore?: ITodo[];
  /** Checklist: items to do after the scenario has finished */
  todoAfter?: ITodo[];
}
