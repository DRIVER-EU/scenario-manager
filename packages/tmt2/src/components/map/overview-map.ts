import m, { FactoryComponent, Attributes } from 'mithril';
import { LeafletMap } from 'mithril-leaflet';
import { IScenario } from '../../../../models';
import L, { geoJSON, GeoJSON } from 'leaflet';
import { MeiosisComponent } from '../../services';
import { isJSON } from '../../utils';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export interface IOverviewMap extends Attributes {
  scenario?: IScenario;
}

/**
 * Map overview
 * TODO Add maps available in a GeoJSON message, SUMO message, etc.
 */
export const OverviewMap: MeiosisComponent = () => {
  let map: L.Map;
  let overlays = undefined as { [key: string]: GeoJSON } | undefined;

  return {
    oninit: async ({
      attrs: {
        state: {
          app: { assets },
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
    },
    view: () =>
      overlays
        ? m(
            'div',
            m(LeafletMap, {
              autoFit: true,
              style: 'width: 100%; height: 90vh; margin: 0;',
              overlays,
              onLoaded: (actualMap) => (map = actualMap),
              visible: overlays ? Object.keys(overlays) : undefined,
              showScale: { imperial: false },
            })
          )
        : m('p', 'No assets found.'),
  };
};
