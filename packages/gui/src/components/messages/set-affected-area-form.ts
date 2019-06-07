import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, NumberInput } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IAffectedArea } from 'trial-manager-models';
import { LeafletMap } from 'mithril-leaflet';
import { Polygon, FeatureCollection } from 'geojson';
import { FeatureGroup, GeoJSON } from 'leaflet';
import { affectedAreaToGeoJSON, geoJSONtoAffectedArea, centerArea } from '../../utils';
import { TrialSvc } from '../../services';

export const SetAffectedAreaForm: FactoryComponent<{
  inject: IInject;
  disabled?: boolean;
  onChange?: () => void;
}> = () => {
  const state = {} as {
    overlays?: { [key: string]: GeoJSON },
  };

  const convertToSec = (n: number) => (n === -1 ? -1 : n / 1000);
  const convertToMSec = (n: number) => (n === -1 ? -1 : n * 1000);

  return {
    oninit: async () => {
      state.overlays = await TrialSvc.overlays();
      m.redraw();
    },
    view: ({ attrs: { inject, disabled, onChange } }) => {
      const { overlays } = state;
      const aa = getMessage<IAffectedArea>(inject, MessageType.SET_AFFECTED_AREA);
      aa.id = inject.id;
      aa.begin = aa.begin || -1;
      aa.end = aa.end || -1;
      aa.restriction = aa.restriction || 'all';

      const area = affectedAreaToGeoJSON(aa.area);
      const { view, zoom } = centerArea(area);

      return [
        m(TextInput, {
          disabled,
          className: 'col s6',
          label: 'Title of the area',
          iconName: 'title',
          isMandatory: true,
          initialValue: inject.title,
          onchange: async v => {
            TrialSvc.overlayRename(inject.title, v);
            state.overlays = await TrialSvc.overlays();
            inject.title = v;
          },
        }),
        m(TextInput, {
          disabled,
          className: 'col s6',
          label: 'Restriction',
          iconName: 'directions',
          helperText: 'Types of the vehicles, which are not allowed in this area (SUMO vehicle types), default "all"',
          isMandatory: true,
          initialValue: aa.restriction,
          onchange: v => (aa.restriction = v),
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => (inject.description = v),
          label: 'Description',
          iconName: 'description',
        }),
        m(NumberInput, {
          disabled,
          className: 'col s6',
          label: 'Begin time',
          iconName: 'timer',
          isMandatory: true,
          helperText: 'Begin time of the duration in seconds or -1 for indefinite',
          initialValue: convertToSec(aa.begin),
          onchange: v => (aa.begin = convertToMSec(v)),
        }),
        m(NumberInput, {
          disabled,
          className: 'col s6',
          label: 'End time',
          iconName: 'timer_off',
          isMandatory: true,
          helperText: 'End time of the duration in seconds or -1 for indefinite',
          initialValue: convertToSec(aa.begin),
          onchange: v => (aa.begin = convertToMSec(v)),
        }),
        m(LeafletMap, {
          style: 'width: 100%; height: 400px; margin-top: 10px;',
          view,
          zoom,
          overlays,
          visible: [inject.title],
          editable: [inject.title],
          showScale: { imperial: false },
          onLayerEdited: (f: FeatureGroup) => {
            const geojson = f.toGeoJSON() as FeatureCollection<Polygon>;
            const a = geoJSONtoAffectedArea(geojson);
            if (a) {
              aa.area = a;
              if (onChange) {
                onChange();
              }
            }
          },
        }),
      ];
    },
  };
};
