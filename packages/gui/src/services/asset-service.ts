import { RestService } from './rest-service';
import { ChannelNames } from '../models/channels';
import { IAsset } from 'trial-manager-models';
import { isJSON } from '../utils';
import { AppState } from '../models';

export class AssetService extends RestService<IAsset> {
  constructor(private pTrialId: string) {
    super(`trials/${pTrialId}/assets`, ChannelNames.ASSETS);
    this.baseUrl = AppState.apiService() + `trials/${pTrialId}/assets`;
  }

  public get trialId() { return this.pTrialId; }

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
