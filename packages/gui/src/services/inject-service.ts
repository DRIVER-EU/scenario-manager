import { Inject } from './../../../server/src/inject/inject.entity';
import { RestService } from './rest-service';
import { ChannelNames } from '../models/channels';

class InjectService extends RestService<Inject> {
  constructor() {
    super('inject', ChannelNames.INJECT);
  }
}

export const InjectSvc = new InjectService();
