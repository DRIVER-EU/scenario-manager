import { IPerson } from '.';

/**
 * A stakeholder, in D+ context, is a Solution. However, it may also be a department or organization that is
 * involved in the exercise.
 */
export interface IStakeholder {
  id?: string;
  name?: string;
  contacts?: IPerson[];
}
