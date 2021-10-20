import m, { Attributes } from 'mithril';
import { LeafletMap } from 'mithril-leaflet';
import { getMessage, IAffectedArea, IRequestMove, IScenario, MessageType } from '../../../../models';
import { geoJSON, GeoJSON } from 'leaflet';
import { MeiosisComponent } from '../../services';
import { affectedAreaToGeoJSON, getInjects, isJSON, routeToGeoJSON, baseLayers } from '../../utils';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export interface IOverviewMap extends Attributes {
  scenario?: IScenario;
}

/**
 * Map overview
 * TODO Add maps available in a GeoJSON message, SUMO message, etc.
 */
export const OverviewMap: MeiosisComponent = () => {
  // let map: L.Map;
  let overlays = {} as { [key: string]: GeoJSON };

  return {
    oninit: async ({
      attrs: {
        state: {
          app: { assets, trial },
        },
      },
    }) => {
      const aliases: string[] = [];
      const jsonAssets = assets
        .filter((a) => a.url && isJSON(a.filename))
        .map((a) => {
          aliases.push(a.alias || a.filename);
          return m.request<FeatureCollection<Geometry, GeoJsonProperties>>(a.url as string);
        });
      const jsons = await Promise.all<FeatureCollection<Geometry, GeoJsonProperties>>(jsonAssets);
      overlays = jsons.reduce((acc, json, index) => {
        if (json && json.features && json.features.length > 0)
          acc[aliases[index]] = geoJSON(json as GeoJSON.FeatureCollection);
        return acc;
      }, {} as { [key: string]: GeoJSON });
      getInjects(trial)
        .filter((i) => i.topic === MessageType.REQUEST_UNIT_MOVE || i.topic === MessageType.SET_AFFECTED_AREA)
        .forEach((i) => {
          switch (i.topic) {
            case MessageType.REQUEST_UNIT_MOVE:
              const ut = getMessage<IRequestMove>(i, MessageType.REQUEST_UNIT_MOVE);
              const route = ut.waypoints ? routeToGeoJSON(ut.waypoints) : undefined;
              if (route) {
                overlays[i.title] = route;
              }
              break;
            case MessageType.SET_AFFECTED_AREA:
              const aa = getMessage<IAffectedArea>(i, MessageType.SET_AFFECTED_AREA);
              const area = affectedAreaToGeoJSON(aa.area);
              if (area) {
                overlays[i.title] = area;
              }
              break;
          }
        });
    },
    view: () =>
      overlays
        ? m(
            'div',
            m(LeafletMap, {
              baseLayers,
              autoFit: true,
              style: 'width: 100%; height: 90vh; margin: 0;',
              overlays,
              // onLoaded: (actualMap) => (map = actualMap),
              visible: overlays ? Object.keys(overlays) : undefined,
              showScale: { imperial: false },
            })
          )
        : m('p', 'No assets found.'),
  };
};
