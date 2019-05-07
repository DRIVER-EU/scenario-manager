import m from 'mithril';
import { TextInput, FileInput, Button, Icon, ModalPanel, MaterialBox } from 'mithril-materialized';
import { ITrial, IAsset, deepCopy, deepEqual } from 'trial-manager-models';
import { assetsChannel, TopicNames } from '../../models';
import { TrialSvc } from '../../services';
import { geoJSON } from 'leaflet';
import { LeafletMap } from 'mithril-leaflet';
import { centerArea } from '../../utils';

export const AssetsForm = () => {
  const state = {
    trial: undefined as ITrial | undefined,
    asset: undefined as IAsset | undefined,
    original: undefined as IAsset | undefined,
    files: undefined as FileList | undefined,
    json: undefined as GeoJSON.FeatureCollection | { [key: string]: any } | undefined,
    overlay: undefined as any | undefined,
    subscription: assetsChannel.subscribe(TopicNames.ITEM, ({ cur }, envelope) => {
      state.json = undefined;
      state.overlay = undefined;
      if (envelope.topic === TopicNames.ITEM_DELETE) {
        state.asset = undefined;
        state.original = undefined;
      } else {
        state.asset = cur ? deepCopy(cur) : undefined;
        state.original = cur ? deepCopy(cur) : undefined;
        if (isJSON.test(cur.filename) && cur.url) {
          m.request(cur.url).then(r => {
            state.json = r;
            const isGeoJSON = state.json && state.json.features && state.json.features.length > 0;
            if (isGeoJSON) {
              state.overlay = geoJSON(state.json as GeoJSON.FeatureCollection);
            }
          });
        }
      }
    }),
  };
  const onsubmit = (e: UIEvent) => {
    e.preventDefault();
    const { asset, files } = state;
    TrialSvc.saveAsset(asset, files);
  };
  const isJSON = new RegExp(/\.json$|\.geojson$/);

  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { asset, files, original, overlay } = state;
      if (!asset) {
        return undefined;
      }
      const hasChanged = (files && files.length > 0) || !deepEqual(asset, original);
      const { view, zoom } = overlay ? centerArea(overlay) : { view: undefined, zoom: undefined };

      return m('.row.sb.large', [
        m(
          '.assets-form',
          asset
            ? [
                m('h4', [
                  m(Icon, {
                    iconName: 'attach_file',
                    style: 'margin-right: 12px;',
                  }),
                  'Asset details',
                ]),
                [
                  m(TextInput, {
                    id: 'name',
                    isMandatory: true,
                    initialValue: asset.alias,
                    // onkeydown: eatSpaces,
                    onchange: (v: string) => (asset.alias = v.replace(/\s/g, '')),
                    label: 'Alias',
                    placeholder: 'No spaces allowed',
                    iconName: 'title',
                    className: 'col s12 m6',
                  }),
                  m(TextInput, {
                    id: 'file',
                    initialValue: asset.filename,
                    disabled: true,
                    label: 'File',
                    iconName: 'attach_file',
                    className: 'col s12 m6',
                  }),
                  m(FileInput, {
                    placeholder: 'Select or replace the file',
                    onchange: (fl: FileList) => (state.files = fl),
                  }),
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
                  asset.mimetype && asset.mimetype.indexOf('image/') === 0 && asset.url
                    ? m(
                        '.col.s12',
                        { style: 'margin: 10px;' },
                        m(MaterialBox, {
                          src: asset.url + `?${asset.filename}`,
                          height: 200,
                        })
                      )
                    : undefined,
                ],
                m('.row.buttons', [
                  m(Button, {
                    iconName: 'undo',
                    class: `green ${hasChanged ? '' : 'disabled'}`,
                    onclick: () => (state.asset = deepCopy(state.original)),
                  }),
                  ' ',
                  m(Button, {
                    iconName: 'save',
                    class: `green ${hasChanged ? '' : 'disabled'}`,
                    onclick: onsubmit,
                  }),
                  ' ',
                  m(Button, {
                    modalId: 'delete',
                    iconName: 'delete',
                    class: 'red',
                  }),
                ]),
                m(ModalPanel, {
                  id: 'delete',
                  title: `Do you really want to delete "${asset.alias || asset.filename}?"`,
                  options: { opacity: 0.7 },
                  buttons: [
                    {
                      label: 'OK',
                      onclick: async () => {
                        await TrialSvc.deleteAsset(asset);
                      },
                    },
                    {
                      label: 'Cancel',
                    },
                  ],
                }),
              ]
            : []
        ),
      ]);
    },
  };
};
