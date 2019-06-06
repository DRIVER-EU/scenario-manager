import m, { FactoryComponent, Attributes } from 'mithril';
import { LeafletMap } from 'mithril-leaflet';
import { centerArea, isJSON, isInjectGroup } from '../../utils';
import { ITrial, IScenario } from 'trial-manager-models';
import { TrialSvc } from '../../services';
import { injectsChannel, TopicNames } from '../../models';

export interface IOverviewMap extends Attributes {
  scenario?: IScenario;
}

export const OverviewMap: FactoryComponent<IOverviewMap> = () => {
  const state = {
    trial: undefined as ITrial | undefined,
    files: undefined as FileList | undefined,
    json: undefined as GeoJSON.FeatureCollection | { [key: string]: any } | undefined,
    overlay: undefined as any | undefined,
    subscription: injectsChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
      if (!isInjectGroup(cur)) {
        // state.selectedTabId = 'message';
      }
    }),
  };
  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { overlay } = state;
      const { view, zoom } = overlay ? centerArea(overlay) : { view: [50, 5] as [number, number], zoom: 5 };

      return m('div', m(LeafletMap, {
        style: 'width: 100%; height: 90vh; margin: 0;',
        view,
        zoom,
        // overlays: { overlay },
        // visible: ['overlay'],
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
      }));
    },
  };
};
