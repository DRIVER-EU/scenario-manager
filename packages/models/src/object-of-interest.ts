import { IPersonOfInterest, IInterest } from '.';

/**
 * An object of interest is a very generic term to denote something relevant for the scenario.
 * Think of a car, bomb, or other specific item.
 */
export interface IObjectOfInterest extends IInterest {
  /** An object can be with one or more persons, e.g. a car hosting several passengers. */
  with?: IPersonOfInterest[];
  /** Owner of the object. */
  owners?: IPersonOfInterest[];
}
