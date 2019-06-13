import { RestService } from './rest-service';
import { ChannelNames } from '../models/channels';
import { IAsset } from 'trial-manager-models';
import { isJSON } from '../utils';

export class AssetService extends RestService<IAsset> {
  constructor(trialId: string) {
    super(`trials/${trialId}/assets`, ChannelNames.ASSETS);
  }

  public async loadMapOverlay(id: number | string) {
    return super.load(id.toString()) as unknown as GeoJSON.FeatureCollection;
  }
  public async loadList() {
    const list = await super.loadList();
    if (list) {
      list.forEach(a => this.addUrl(a));
      return list;
    }
  }

  public async mapOverlays() {
    const list = await super.loadList();
    if (list) {
      list.filter(a => a.mimetype === 'application/json' || isJSON(a.filename)).forEach(a => this.addUrl(a));
      return list;
    }
  }

  public addUrl(a: IAsset) {
    a.url = `${this.baseUrl}${a.id}`;
    return a;
  }
}
