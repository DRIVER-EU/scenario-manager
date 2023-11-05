import m from 'mithril';
import { TextInput, Select, FlatButton, ModalPanel, TextArea } from 'mithril-materialized';
import { getMessage, MessageType, IGeoJsonMessage } from 'trial-manager-models';
import { isJSON, getActiveTrialInfo, baseLayers } from '../../utils';
import { UploadAsset } from '../ui';
import { ILeafletMap, LeafletMap } from 'mithril-leaflet';
import { geoJSON, GeoJSON } from 'leaflet';
import { MessageComponent } from '../../services';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

export const GeoJsonMessageForm: MessageComponent = () => {
  let overlays: { [key: string]: GeoJSON | undefined };

  return {
    view: ({
      attrs: {
        state,
        actions: { updateInject, createAsset },
        options: { editing } = { editing: true },
      },
    }) => {
      const { assetId, assets } = state.app;
      const { inject } = getActiveTrialInfo(state);
      if (!inject) return;
      const disabled = !editing;
      const gm = getMessage<IGeoJsonMessage>(inject, MessageType.GEOJSON_MESSAGE);
      if (!gm.assetId && assetId) {
        gm.assetId = assetId;
        updateInject(inject);
      }

      const availableAssets = assets
        .filter((a) => a.url && isJSON(a.filename))
        .map((a) => ({ id: a.id, label: a.alias || a.filename, url: a.url })).sort((a, b) => a.label.localeCompare(b.label));
      // console.log('availableAssets', availableAssets);
      const cur = gm.assetId && availableAssets.filter((a) => a.id === gm.assetId).shift();
      if ((!overlays || (gm.alias && !overlays.hasOwnProperty(gm.alias))) && cur && cur.url) {
        m.request<FeatureCollection<Geometry, GeoJsonProperties>>(cur.url as string).then((r) => {
          const isGeoJSON = r && r.features && r.features.length > 0;
          if (isGeoJSON) {
            overlays = { [cur.label]: geoJSON(r) };
          }
        });
      }

      return [
        m('.row', [
          m(TextInput, {
            disabled,
            id: 'title',
            isMandatory: true,
            className: 'col s12 m6',
            initialValue: inject.title,
            onchange: (v: string) => {
              inject.title = v;
              updateInject(inject);
            },
            label: 'Title',
            iconName: 'title',
          }),
          m(Select, {
            disabled,
            label: 'Asset',
            isMandatory: true,
            placeholder: 'Select a geojson file',
            className: 'col s6 m4',
            checkedId: gm.assetId,
            options: availableAssets,
            onchange: (v) => {
              const assetId = +(v[0] as number);
              gm.assetId = assetId;
              const asset = assets.filter((a) => a.id === assetId).shift();
              gm.alias = asset ? asset.alias : undefined;
              updateInject(inject);
            },
          }),
          m(FlatButton, {
            disabled,
            className: 'input-field col s6 m1',
            modalId: 'upload',
            iconName: 'file_upload',
          }),
          m(TextInput, {
            disabled,
            id: 'id',
            label: 'Layer identifier',
            iconName: 'anchor',
            helperText: 'Unique identifiers create new layers',
            isMandatory: true,
            className: 'col s12 m4',
            initialValue: gm.layerId,
            onchange: (v: string) => {
              gm.layerId = v;
              updateInject(inject);
            },
          }),
          m(TextInput, {
            disabled,
            id: 'layerName',
            label: 'Layer name',
            iconName: 'label',
            helperText: 'Used in map legend',
            isMandatory: true,
            className: 'col s12 m4',
            initialValue: gm.layerName,
            onchange: (v: string) => {
              gm.layerName = v;
              updateInject(inject);
            },
          }),
          m(TextInput, {
            disabled,
            id: 'layerStyle',
            label: 'Layer style',
            iconName: 'style',
            helperText: 'Determines visual appearance',
            isMandatory: true,
            className: 'col s12 m4',
            initialValue: gm.layerStyle,
            onchange: (v: string) => {
              gm.layerStyle = v;
              updateInject(inject);
            },
          }),
          m(TextArea, {
            disabled,
            id: 'desc',
            label: 'Description',
            iconName: 'note',
            className: 'col s12',
            initialValue: gm.layerDesc,
            onchange: (v: string) => {
              gm.layerDesc = inject.description = v;
              updateInject(inject);
            },
          }),
        ]),
        [
          overlays
            ? m(LeafletMap, {
              key: inject.id,
              baseLayers,
              style: 'width: 100%; height: 400px; margin: 10px;',
              autoFit: true,
              overlays,
              visible: gm && gm.alias ? [gm.alias] : undefined,
              // editable: ['overlay'],
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
            } as ILeafletMap)
            : undefined,
        ],
        m(ModalPanel, {
          disabled,
          id: 'upload',
          title: 'Upload a new GeoJSON file',
          description: m(UploadAsset, {
            accept: ['.json', '.geojson'],
            placeholder: 'Upload a (geo-)json file.',
            createAsset,
            done: () => {
              const el = document.getElementById('upload');
              if (el) {
                M.Modal.getInstance(el).close();
              }
            },
          }),
          bottomSheet: true,
        }),
      ];
    },
  };
};
