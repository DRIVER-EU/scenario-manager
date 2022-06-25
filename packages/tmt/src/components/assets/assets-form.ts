import m from 'mithril';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { TextInput, FileInput, Button, Icon, ModalPanel, MaterialBox, UrlInput } from 'mithril-materialized';
import { IAsset, deepCopy, deepEqual } from 'trial-manager-models';
import { geoJSON, GeoJSON } from 'leaflet';
import { LeafletMap } from 'mithril-leaflet';
import { isJSON, baseLayers } from '../../utils';
import { MeiosisComponent } from '../../services';

export const AssetsForm: MeiosisComponent = () => {
  let asset = {} as IAsset;
  let files = undefined as FileList | undefined;
  let overlay = undefined as GeoJSON | undefined;
  let filePreview: string = '';
  let prev_file_id: number;

  return {
    view: ({
      attrs: {
        state: {
          app: { assets, assetId },
        },
        actions: { deleteAsset, updateAsset },
      },
    }) => {
      const original = assets.filter((a) => a.id === assetId).shift();
      if (!original) {
        return m('p', m('i', 'Please select an asset in the list, or create a new one using the + button.'));
      }
      if (!asset || asset.id !== assetId) {
        files = undefined;
        overlay = undefined;
        asset = deepCopy(original);
      }
      const hasChanged = (files && files.length > 0) || !deepEqual(asset, original);
      if (!overlay && isJSON(asset.filename) && asset.url) {
        m.request<FeatureCollection<Geometry, GeoJsonProperties>>(asset.url).then((json) => {
          const isGeoJSON = json && json.features && json.features.length > 0;
          if (isGeoJSON) {
            overlay = geoJSON(json as GeoJSON.FeatureCollection);
          }
        });
      }
      if (asset.id && prev_file_id != asset?.id && asset.url) {
        prev_file_id = asset?.id;
        asset.url.length > 1
          ? m.request({ url: asset?.url as string, method: 'GET' }).then((json) => {
              filePreview = JSON.stringify(json, undefined, 4);
            })
          : undefined;
      } else if (!asset.url) {
        filePreview = '';
        prev_file_id = asset.id;
      }

      return m('.row.sb.large', [
        m(
          '.assets-form',
          {
            key: asset.filename,
          },
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
                    onchange: (v: string) => (asset.alias = v.replace(/\s/g, '_')),
                    label: 'Alias',
                    placeholder: 'No spaces allowed',
                    iconName: 'title',
                    className: 'col s12 m6',
                  }),
                  m(UrlInput, {
                    id: 'file',
                    initialValue: asset.url,
                    disabled: true,
                    label: 'URL',
                    iconName: 'link',
                    className: 'col s12 m6',
                  }),
                  m(FileInput, {
                    initialValue: asset.filename,
                    placeholder: 'Select or replace the file',
                    onchange: (fl: FileList) => (files = fl),
                  }),
                  overlay && filePreview !== ''
                    ? [m(LeafletMap, {
                      className: 'col s6',
                        baseLayers,
                        style: 'height: 400px',
                        overlays: { [asset.alias || asset.filename]: overlay },
                        visible: [asset.alias || asset.filename],
                        showScale: { imperial: false },
                        onLoaded: (map) => {
                          overlay && map.fitBounds(overlay?.getBounds());
                        },
                      }),
                      m('div.input-field.col.s6', { style: 'height: 400px; margin: 0px' }, [
                        m('span', 'File Preview'),
                        m(
                          'textarea.materialize-textarea',
                          { style: 'height: 380px; overflow-y: auto;', disabled: true, id: 'previewArea' },
                          filePreview
                        ),
                      ])]
                    : overlay
                    ? m(LeafletMap, {
                        baseLayers,
                        style: 'width: 100%; height: 400px; margin: 5px;',
                        overlays: { [asset.alias || asset.filename]: overlay },
                        visible: [asset.alias || asset.filename],
                        showScale: { imperial: false },
                        onLoaded: (map) => {
                          overlay && map.fitBounds(overlay?.getBounds());
                        },
                      })
                    : filePreview !== ''
                    ? m('div.input-field.col.s12', { style: 'height: 400px; margin-bottom: 40px' }, [
                        m('span', 'File Preview'),
                        m(
                          'textarea.materialize-textarea',
                          { style: 'height: 400px; overflow-y: auto;', disabled: true, id: 'previewArea' },
                          filePreview
                        ),
                      ])
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
                m(
                  '.row.buttons',
                  m('.col.s12', [
                    m(Button, {
                      iconName: 'undo',
                      class: `green ${hasChanged ? '' : 'disabled'}`,
                      onclick: () => (asset = deepCopy(original)),
                    }),
                    ' ',
                    m(Button, {
                      iconName: 'save',
                      class: `green ${hasChanged ? '' : 'disabled'}`,
                      onclick: async () => {
                        await updateAsset(asset, files);
                        asset = {} as IAsset;
                        files = undefined;
                        prev_file_id = -1;
                      },
                    }),
                    ' ',
                    m(Button, {
                      modalId: 'delete',
                      iconName: 'delete',
                      class: 'red',
                    }),
                  ])
                ),
                m(ModalPanel, {
                  id: 'delete',
                  title: `Do you really want to delete "${asset.alias || asset.filename}?"`,
                  options: { opacity: 0.7 },
                  buttons: [
                    {
                      label: 'OK',
                      onclick: async () => {
                        await deleteAsset(asset);
                        asset = {} as IAsset;
                        files = undefined;
                        prev_file_id = -1;
                        overlay = undefined;
                        filePreview = '';
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
