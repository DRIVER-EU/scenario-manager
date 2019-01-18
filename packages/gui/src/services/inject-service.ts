import { RestService } from './rest-service';
import { ChannelNames } from '../models/channels';
import { IInject } from '../models/inject';

class InjectService extends RestService<IInject> {
  constructor() {
    super('inject', ChannelNames.INJECT);
  }
}

export const InjectSvc = new InjectService();
