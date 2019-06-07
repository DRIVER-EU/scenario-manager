import m, { FactoryComponent, Attributes } from 'mithril';
import { LeafletMap } from 'mithril-leaflet';
import { isInjectGroup } from '../../utils';
import { IScenario } from 'trial-manager-models';
import { injectsChannel, TopicNames } from '../../models';
import L, { GeoJSON } from 'leaflet';
import { TrialSvc } from '../../services';

export interface IOverviewMap extends Attributes {
  scenario?: IScenario;
}

export const OverviewMap: FactoryComponent<IOverviewMap> = () => {
  const state = {
    files: undefined as FileList | undefined,
    json: undefined as GeoJSON.FeatureCollection | { [key: string]: any } | undefined,
    overlay: undefined as any | undefined,
    overlays: undefined as { [key: string]: GeoJSON } | undefined,
    map: undefined as L.Map | undefined,
    subscription: injectsChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
      if (!isInjectGroup(cur)) {
        // state.selectedTabId = 'message';
      }
    }),
  };

  const bounds = ()  => {
    const { overlays } = state;
    if (!overlays) {
      return;
    }
    const fg = new L.FeatureGroup(Object.keys(overlays).map(key => overlays[key]));
    return fg.getBounds();
  };

  return {
    oninit: async () => {
      state.overlays = await TrialSvc.overlays();
      m.redraw();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    onupdate: () => {
      if (state.map) {
        const b = bounds();
        if (b) {
          state.map.fitBounds(b);
        }
      }
    },
    view: () => {
      const { overlays } = state;
      // const { view, zoom } = { view: [50, 5] as [number, number], zoom: 5 };

      return m(
        'div',
        m(LeafletMap, {
          style: 'width: 100%; height: 90vh; margin: 0;',
          overlays,
          onLoaded: map => state.map = map,
          visible: overlays ? Object.keys(overlays) : undefined,
          // editable: ['overlay'],
          // onMapClicked: console.log,
          showScale: { imperial: false },
          // onLayerEdited: (f: FeatureGroup) => {
          //   const geojson = f.toGeoJSON() as FeatureCollection<LineString>;
          //   const r = geoJSONtoRoute(geojson);
          //   if (r) {
          //     ut.route = r;
          //     if (onChange) {
          //       onChange();
          //     }
          //   }
          // },
        })
      );
    },
  };
};
