import { RestService } from './rest-service';
import { IObjective } from '../models/objective';
import { ChannelNames } from '../models/channels';

class ObjectiveService extends RestService<IObjective> {
  constructor() {
    super('objective', ChannelNames.OBJECTIVE);
  }
}

export const ObjectiveSvc = new ObjectiveService();
