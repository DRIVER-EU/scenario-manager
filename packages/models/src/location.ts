/** A location is a point where something interesting, in scenario terms, may occur. */
export interface ILocationAddress {
  name: string;
  description?: string;
  address?: {
    type: 'Home' | 'Work' | 'Other';
    street?: string;
    houseNumber?: string;
    zip?: string;
    city?: string;
    country?: string;
  };
  /** May be used to render the location on a map, e.g. the type of icon to use. */
  locationType?: string;
  /** Optional address of the location, in case it is deemed relevant. */
  addres?: string;
  /** Latitude in WGS84 */
  lat: number;
  /** Longitude in WGS84 */
  lon: number;
}
