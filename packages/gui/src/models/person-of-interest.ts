import { IObjectOfInterest, ILocation } from '.';

export interface IInterest {
  name: string;
  description?: string;
  /** Image of the item */
  image?: string;
  /** Locations that may be relevant for the object or person, e.g. base|work|home location, etc. */
  locations?: ILocation[];
  parameters?: {
    [key: string]: unknown;
  };
}

/**
 * An person of interest represents a person relevant for the scenario.
 */
export interface IPersonOfInterest extends IInterest {
  isAlive: boolean;
  phones?: Array<{
    type: 'Home' | 'Work' | 'Other';
    number: string;
  }>;
  /** May have/own a number of items that are of interest. */
  owns?: IObjectOfInterest[];
}
