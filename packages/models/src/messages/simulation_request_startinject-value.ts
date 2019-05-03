/**
 * Request for starting a simulation inject. *Copyright (C) 2017-2018 XVR
 * Simulation B.V., Delft, The Netherlands, Martijn Hendriks <hendriks @
 * xvrsim.com>. This file is part of DRIVER+ WP923 Test-bed infrastructure
 * project. This file is licensed under the MIT license :
 * https://github.com/DRIVER-EU/avro-schemas/blob/master/LICENSE*
 */
export interface IRequestStartInject {
  /** Globally unique identifier for this request */
  guid: string;
  /** Identifier of the simulator currently responsible for this request */
  owner: string;
  /** Name of the inject that needs to be started */
  inject: string;
}
