import { RestService } from './rest-service';
import { ChannelNames } from '../models/channels';
import { IInject } from 'trial-manager-models';
import { AppState } from '../models';
import { messageBus } from './message-bus-service';

class InjectService extends RestService<IInject> {
  constructor() {
    super('inject', ChannelNames.INJECT);
    this.updateBaseUrl();
    messageBus.channel<string>('apiServer').subscribe('update', apiService => {
      console.warn('InjectService: ' + apiService);
      this.updateBaseUrl(apiService);
    });
  }

  protected updateBaseUrl(apiServer = AppState.apiService()) {
    this.baseUrl = `${apiServer}/${this.urlFragment}/`;
  }
}

export const InjectSvc = new InjectService();
