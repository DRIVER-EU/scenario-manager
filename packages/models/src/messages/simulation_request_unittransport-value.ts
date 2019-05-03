/** WGS84-based standard representation of a location on earth */
export interface ILocation {
  /** Latitude in degrees (-90, 90] - 0 is equator */
  latitude: number;
  /**
   * Longitude in degrees (-180, 180] - 0 is line [geographic north - Greenwich -
   * geographic south]
   */
  longitude: number;
  /** Altitude in meters - 0 is surface of WGS84-based ellipsoid */
  altitude?: null | undefined | number;
}

/**
 * Request for transporting a complete unit. *Copyright (C) 2017-2018 XVR
 * Simulation B.V., Delft, The Netherlands, Martijn Hendriks <hendriks @
 * xvrsim.com>. This file is part of DRIVER+ WP923 Test-bed infrastructure
 * project. This file is licensed under the MIT license :
 * https://github.com/DRIVER-EU/avro-schemas/blob/master/LICENSE*
 */
export interface IRequestUnitTransport {
  /** Globally unique identifier for this request */
  guid: string;
  /** Identifier of the simulator currently responsible for this request */
  owner: string;
  /** Globally unique identifier for the unit that should transport */
  unit: string;
  /**
   * Globally unique identifier for the station that should be the destination
   */
  destination: string;
  /** List of locations that describes the route towards the destination */
  route?: null | undefined | ILocation[];
}
