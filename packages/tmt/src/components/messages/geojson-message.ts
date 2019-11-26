import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, FlatButton, ModalPanel, MapEditor } from 'mithril-materialized';
import { getMessage, IAsset, IInject, MessageType, IGeoJsonMessage } from 'trial-manager-models';
import { getMessageSubjects, centerArea } from '../../utils';
import { TrialSvc } from '../../services';
import { UploadAsset } from '../ui';
import { LeafletMap } from 'mithril-leaflet';
import { geoJSON, GeoJSON } from 'leaflet';

export const GeoJsonMessageForm: FactoryComponent<{
  inject: IInject;
  onChange?: (inject: IInject) => void;
  disabled?: boolean;
}> = () => {
  const state = {
    overlay: undefined,
  } as {
    assets?: IAsset[];
    overlay?: GeoJSON;
  };

  return {
    oninit: async () => {
      state.assets = await TrialSvc.mapOverlays();
    },
    view: ({ attrs: { inject, disabled, onChange } }) => {
      const update = () => onChange && onChange(inject);
      const { overlay, assets = [] } = state;
      const pm = getMessage<IGeoJsonMessage>(inject, MessageType.GEOJSON_MESSAGE);
      const subjects = getMessageSubjects(MessageType.GEOJSON_MESSAGE);
      if (!pm.subjectId && subjects.length === 1) {
        pm.subjectId = subjects[0].id;
      }

      const availableAssets = assets.map(a => ({ id: a.id, label: a.alias || a.filename, url: a.url }));
      const cur = pm.assetId && availableAssets.filter(a => a.id === pm.assetId).shift();
      if (!overlay && cur && cur.id) {
        TrialSvc.loadMapOverlay(cur.id).then(r => {
          const isGeoJSON = r && r.features && r.features.length > 0;
          if (isGeoJSON) {
            state.overlay = geoJSON(r);
          }
        });
      }

      const { view, zoom } = overlay ? centerArea(overlay) : { view: undefined, zoom: undefined };

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
              },
              label: 'Title',
              iconName: 'title',
            })
          ),
          m(Select, {
            disabled,
            placeholder: subjects.length === 0 ? 'First create a subject' : 'Select a subject',
            className: 'col s6 m3',
            label: 'Subject',
            isMandatory: true,
            options: subjects,
            checkedId: pm.subjectId,
            onchange: v => {
              pm.subjectId = v[0] as string;
              update();
            },
          }),
          m(Select, {
            disabled,
            label: 'Asset',
            isMandatory: true,
            placeholder: 'Select a geojson file',
            className: 'col s6 m4',
            checkedId: pm.assetId,
            options: availableAssets,
            onchange: v => {
              const assetId = +(v[0] as number);
              pm.assetId = assetId;
              const asset = assets.filter(a => a.id === assetId).shift();
              pm.alias = asset ? asset.alias : undefined;
              update();
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
            onchange: (v: string) => (inject.description = v),
            label: 'Description',
            iconName: 'short_text',
          }),
          m(FlatButton, {
            disabled,
            className: 'input-field col s2 m1',
            iconName: pm.properties ? 'delete' : 'add',
            onclick: () => {
              if (pm.properties) {
                delete pm.properties;
              } else {
                pm.properties = {};
              }
            },
          }),
        ]),
        pm.properties
          ? m(MapEditor, {
              disabled,
              label: 'Properties',
              iconName: 'dns',
              disallowArrays: true,
              properties: pm.properties,
            })
          : undefined,
        overlay
          ? m(LeafletMap, {
              style: 'width: 100%; height: 400px; margin: 10px;',
              view,
              zoom,
              overlays: { overlay },
              visible: ['overlay'],
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
          : undefined,
        m(ModalPanel, {
          disabled,
          id: 'upload',
          title: 'Upload a new GeoJSON file',
          description: m(UploadAsset, {
            accept: ['.json', '.geojson'],
            placeholder: '',
            assetUploaded: async (a: IAsset) => {
              state.assets = await TrialSvc.mapOverlays();
              pm.assetId = a.id;
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
