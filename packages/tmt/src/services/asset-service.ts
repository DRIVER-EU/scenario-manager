import { RestService } from './rest-service';
import { ChannelNames } from '../models/channels';
import { IAsset } from 'trial-manager-models';
import { isJSON } from '../utils';
import { AppState } from '../models';
import { messageBus } from './message-bus-service';

export class AssetService extends RestService<IAsset> {
  constructor(private pTrialId: string) {
    super('', ChannelNames.ASSETS);
    this.updateBaseUrl();
    messageBus.channel<string>('apiServer').subscribe('update', apiService => {
      // console.warn('AssetService: ' + apiService);
      this.updateBaseUrl(apiService);
    });
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

  protected updateBaseUrl(apiServer = AppState.apiService()) {
    this.baseUrl = `${apiServer}/trials/${this.pTrialId}/assets/`;
  }
}
