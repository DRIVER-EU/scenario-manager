import { Objective } from './../../../server/src/objective/objective.entity';
import { RestService } from './rest-service';
import { ChannelNames } from '../models/channels';

class ObjectiveService extends RestService<Objective> {
  constructor() {
    super('objective', ChannelNames.OBJECTIVE);
  }
}

export const ObjectiveSvc = new ObjectiveService();
