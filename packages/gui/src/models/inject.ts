import { InjectLevel } from './inject-level';
import { InjectState, IContent, InjectType } from '.';

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
