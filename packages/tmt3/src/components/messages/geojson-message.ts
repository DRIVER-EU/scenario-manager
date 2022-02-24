import m from 'mithril';
import { TextArea, TextInput, Select, FlatButton, ModalPanel, MapEditor } from 'mithril-materialized';
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
      const subjects = [] as Array<{ id: string; label: string }>; // getMessageSubjects(trial, MessageType.GEOJSON_MESSAGE);
      if (!gm.subjectId && subjects.length === 1) {
        gm.subjectId = subjects[0].id;
      }

      const availableAssets = assets
        .filter((a) => a.url && isJSON(a.filename))
        .map((a) => ({ id: a.id, label: a.alias || a.filename, url: a.url }));
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
          m(
            '.col.s12.m4',
            m(TextInput, {
              disabled,
              id: 'title',
              isMandatory: true,
              initialValue: inject.title,
              onchange: (v: string) => {
                inject.title = v;
                updateInject(inject);
              },
              label: 'Title',
              iconName: 'title',
            })
          ),
          m(Select, {
            disabled: disabled || subjects.length === 0,
            placeholder: subjects.length === 0 ? 'First create a subject' : 'Select a subject',
            className: 'col s6 m3',
            label: 'Subject',
            isMandatory: true,
            options: subjects,
            checkedId: gm.subjectId,
            onchange: (v) => {
              gm.subjectId = v[0] as string;
              updateInject(inject);
            },
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
        ]),
        m('.row', [
          m(TextArea, {
            disabled,
            id: 'desc',
            className: 'col s10 m11',
            initialValue: inject.description,
            onchange: (v: string) => {
              inject.description = v;
              updateInject(inject);
            },
            label: 'Description',
            iconName: 'short_text',
          }),
          m(FlatButton, {
            disabled,
            className: 'input-field col s2 m1',
            iconName: gm.properties ? 'delete' : 'add',
            onclick: () => {
              if (gm.properties) {
                delete gm.properties;
              } else {
                gm.properties = {};
              }
              updateInject(inject);
            },
          }),
        ]),
        gm.properties
          ? m(MapEditor, {
              disabled,
              label: 'Properties',
              iconName: 'dns',
              disallowArrays: true,
              properties: gm.properties,
            })
          : undefined,
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
