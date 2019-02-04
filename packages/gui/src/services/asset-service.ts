import { RestService } from './rest-service';
import { ChannelNames } from '../models/channels';
import { IAsset } from 'trial-manager-models';

export class AssetService extends RestService<IAsset> {
  constructor(trialId: string) {
    super(`trials/${trialId}/assets`, ChannelNames.ASSETS);
  }

  public async loadList() {
    const list = await super.loadList();
    list.forEach(a => this.addUrl(a));
    return list;
  }

  public addUrl(a: IAsset) {
    a.url = `${this.baseUrl}${a.id}`;
    return a;
  }
}
