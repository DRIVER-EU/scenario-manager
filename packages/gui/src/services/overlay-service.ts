import {
  isScenario,
  isGeoJSONMessage,
  isAffectedArea,
  affectedAreaToGeoJSON,
  isTransportRequest,
  routeToGeoJSON,
} from '../utils';
import {
  pruneInjects,
  getMessage,
  IGeoJsonMessage,
  MessageType,
  IAffectedArea,
  IRequestUnitTransport,
} from 'trial-manager-models';
import { TrialSvc } from './trial-service';
import { AppState } from '../models';
import { geoJSON, GeoJSON } from 'leaflet';

class OverlayService {
  private state = {
    overlays: {},
  } as {
    overlays: { [scenarioId: string]: { [layerId: string]: GeoJSON } };
  };

  public async overlays() {
    const { scenarioId } = AppState;
    if (!scenarioId) {
      return;
    }
    if (!this.state.overlays.hasOwnProperty(scenarioId)) {
      await this.loadOverlays(scenarioId);
    }
    return this.state.overlays[scenarioId];
  }

  private async loadOverlays(scenarioId: string) {
    const injects = TrialSvc.getInjects() || [];
    const scenario = injects
      .filter(isScenario)
      .filter(s => s.id === AppState.scenarioId)
      .shift();
    if (scenario) {
      const scenarioInjects = pruneInjects(scenario, injects) || [];
      const geojsonAssets = scenarioInjects
        .filter(isGeoJSONMessage)
        .map(i => {
          const geojsonMsg = getMessage<IGeoJsonMessage>(i, MessageType.GEOJSON_MESSAGE);
          return geojsonMsg;
        })
        .filter(a => a.assetId);
      const data = await Promise.all(geojsonAssets.map(a => TrialSvc.loadMapOverlay(a.assetId!)));
      const layers = data.reduce(
        (acc, d, i) => {
          const { assetId = 0, alias } = geojsonAssets[i];
          acc[alias || assetId.toString()] = geoJSON(d);
          return acc;
        },
        {} as { [key: string]: GeoJSON }
      );
      scenarioInjects.filter(isAffectedArea).map(i => {
        const aa = getMessage<IAffectedArea>(i, MessageType.SET_AFFECTED_AREA);
        const geojson = affectedAreaToGeoJSON(aa.area);
        layers[i.title] = geojson;
      });
      scenarioInjects.filter(isTransportRequest).map(i => {
        const ut = getMessage<IRequestUnitTransport>(i, MessageType.REQUEST_UNIT_TRANSPORT);
        const geojson = routeToGeoJSON(ut.route);
        layers[i.title] = geojson;
      });
      this.state.overlays[scenarioId] = layers;
    }
  }
}

export const OverlaySvc = new OverlayService();
