import m from 'mithril';
import { TextArea, TextInput, NumberInput } from 'mithril-materialized';
import { getMessage, MessageType, IAffectedArea, IareaPoly } from '../../../../models';
import { LeafletMap } from 'mithril-leaflet';
import { Polygon, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { FeatureGroup, geoJSON, GeoJSON } from 'leaflet';
import { affectedAreaToGeoJSON, geoJSONtoAffectedArea, getInject, isJSON } from '../../utils';
import { MeiosisComponent } from '../../services';

export const SetAffectedAreaForm: MeiosisComponent = () => {
  let overlays: { [key: string]: GeoJSON } = {};

  const convertToSec = (n: number) => (n === -1 ? -1 : n / 1000);
  const convertToMSec = (n: number) => (n === -1 ? -1 : n * 1000);
  const areaLayer = 'Area layer';

  return {
    oninit: async ({
      attrs: {
        state: {
          app: { trial, injectId, assets },
        },
      },
    }) => {
      const inject = getInject(trial, injectId);
      if (!inject) return;
      const aa = getMessage<IAffectedArea>(inject, MessageType.SET_AFFECTED_AREA);
      aa.id = inject.id;
      aa.begin = aa.begin || -1;
      aa.end = aa.end || -1;
      aa.restriction = aa.restriction || 'all';
      overlays[areaLayer] = affectedAreaToGeoJSON(aa.area);
      const jsonAssets = assets.filter((a) => a.url && isJSON(a.filename));
      for (const asset of jsonAssets) {
        const result = await m.request<FeatureCollection<Geometry, GeoJsonProperties>>(asset.url as string);
        if (result) {
          overlays[asset.alias || asset.filename] = geoJSON(result);
        }
      }
    },
    view: ({
      attrs: {
        state: {
          app: { trial, injectId, mode },
        },
        actions: { updateInject },
      },
    }) => {
      const disabled = mode !== 'edit';
      const inject = getInject(trial, injectId);
      if (!inject) return;
      const aa = getMessage<IAffectedArea>(inject, MessageType.SET_AFFECTED_AREA);
      const addArea = (area: IareaPoly) => {
        const inj = getInject(trial, injectId);
        if (inj) {
          const m = getMessage<IAffectedArea>(inj, MessageType.REQUEST_UNIT_MOVE);
          m.area = area;
          updateInject(inj);
        }
      };
      return [
        m(TextInput, {
          disabled,
          className: 'col s6',
          label: 'Title of the area',
          iconName: 'title',
          isMandatory: true,
          initialValue: inject.title,
          onchange: async (v) => {
            inject.title = v;
            updateInject(inject);
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
          onchange: (v) => {
            aa.restriction = v;
            updateInject(inject);
          },
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => {
            inject.description = v;
            updateInject(inject);
          },
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
          onchange: (v) => {
            aa.begin = convertToMSec(v);
            updateInject(inject);
          },
        }),
        m(NumberInput, {
          disabled,
          className: 'col s6',
          label: 'End time',
          iconName: 'timer_off',
          isMandatory: true,
          helperText: 'End time of the duration in seconds or -1 for indefinite',
          initialValue: convertToSec(aa.begin),
          onchange: (v) => {
            aa.begin = convertToMSec(v);
            updateInject(inject);
          },
        }),
        m(LeafletMap, {
          style: 'width: 100%; height: 400px; margin-top: 10px;',
          // view,
          // zoom,
          autoFit: true,
          overlays,
          visible: [areaLayer],
          editable: [areaLayer],
          showScale: { imperial: false },
          onLayerEdited: (f: FeatureGroup) => {
            const geojson = f.toGeoJSON() as FeatureCollection<Polygon>;
            const a = geoJSONtoAffectedArea(geojson);
            a && addArea(a);
          },
        }),
      ];
    },
  };
};
