import { IPersonOfInterest } from './person-of-interest.js';

/** Group structure, e.g. a team, department, organisation. */
export interface IGroup {
  name: string;
  description?: string;
  members?: IPersonOfInterest[];
}
