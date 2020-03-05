/**
 * A location is defined as a WGS84-based standard representation of a location on
 * earth
 */
export interface ILocation {
  /** In decimal degrees, ranging from [-90, 90] where 0 is the equator */
  latitude: number;
  /**
   * In decimal degrees, ranging from (-180, 180] where 0 is the Prime Meridian
   * (line going through the geographic north, Greenwich, and the geographic south)
   */
  longitude: number;
  /** Optional in meters, where 0 is the surface of the WGS84-based ellipsoid */
  altitude?: null | undefined | number;
}

/**
 * A transport request is a specific request for transporting or moving a given
 * entity towards a given destination, possibly over a given route. *Copyright
 * (C) 2019-2020 XVR Simulation B.V., Delft, The Netherlands, Martijn Hendriks
 * <hendriks @ xvrsim.com>. This file is licensed under the MIT license :
 * https://github.com/DRIVER-EU/avro-schemas/blob/master/LICENSE*
 */
export interface IRequestTransport {
  /** Unique identifier of the request */
  id: string;
  /** Unique identifier of the connected application sending the request */
  applicant: string;
  /** Unique identifier of the entity the applicant requests to be transported */
  entity: string;
  /**
   * Unique identifier of the entity the applicant requests the given entity to
   * transport to
   */
  destination: string;
  /**
   * Optional list of locations, creating an edge between every consecutive location
   * in the list defining the preferred route of the transport
   */
  route?: null | undefined | ILocation[];
  /**
   * Optional map containing transport request specific information: key – unique
   * name of the specific property; value – value of that property
   */
  tags?: null | undefined | { [key: string]: string };
}
