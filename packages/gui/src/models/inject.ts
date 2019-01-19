import { IContent } from '.';

export interface IInjectGroup extends IInject  {
  mainObjectiveId?: string;
  secondaryObjectiveId?: string;
}

export enum InjectType {
  PARTICIPANT_MESSAGE = 'PARTICIPANT_MESSAGE',
  OBSERVER_MESSAGE = 'OBSERVER_MESSAGE',
  ROLE_PLAYER_MESSAGE = 'ROLE_PLAYER_MESSAGE',
  OPERATOR_MESSAGE = 'OPERATOR_MESSAGE',
  AUTOMATED_ACTION = 'AUTOMATED_ACTION',
  BRANCH = 'BRANCH',
  WAIT_FOR_OPERATOR_INPUT = 'WAIT_FOR_OPERATOR_INPUT',
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

export enum InjectLevel {
  INJECT = 'INJECT',
  ACT = 'ACT',
  STORYLINE = 'STORYLINE',
}

export enum InjectCondition {
  DELAY = 'DELAY',
}

/*
An inject can occur after a number of conditions:

Time-based conditions are all delays:
- After a fixed delay (in seconds/minutes/hours)
- Immediately after the previous inject (which is a fixed delay of 0 sec)
- At a certain time (which is also a fixed delay, but relative to the scenario start time)

Optionally, you may need to satisfy certain conditions:
- Another inject is completed

*/

export interface IInject extends IContent  {
  /** Who performs the action */
  actorId?: string;
  /** Who is the recipient/receiver of the action/message */
  recipientId?: string;
  /**
   * Depends on the successful execution/completion of another inject, where
   * an inject may also be an act or storyline:
   * - Each row can contain one or more IDs, comma separated.
   * - In case a row contains more IDs, separated by &, they are treated as AND conditions.
   * - Each row is treated as an OR condition.
   * E.g. ['a & b', 'c'] means that the pre-conditions of an inject are fullfilled
   * when c is completed, OR when a AND b are completed.
   */
  dependsOn?: string[];
  state?: InjectState;
  level?: InjectLevel;
  type?: InjectType;
}
