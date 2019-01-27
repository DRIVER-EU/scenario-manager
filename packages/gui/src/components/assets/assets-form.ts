import m from 'mithril';
import { TextInput, FileInput, Button, Icon, ModalPanel, MaterialBox } from 'mithril-materialized';
import { ITrial, TopicNames, assetsChannel, IAsset } from '../../models';
import { deepCopy, deepEqual } from '../../utils';
import { TrialSvc } from '../../services';
import { uniqueId } from './../../utils/utils';

export const AssetsForm = () => {
  const state = {
    trial: undefined as ITrial | undefined,
    asset: undefined as IAsset | undefined,
    original: undefined as IAsset | undefined,
    files: undefined as FileList | undefined,
    subscription: assetsChannel.subscribe(TopicNames.ITEM, ({ cur }, envelope) => {
      if (envelope.topic === TopicNames.ITEM_DELETE) {
        state.asset = undefined;
        state.original = undefined;
      } else {
        state.asset = cur ? deepCopy(cur) : undefined;
        state.original = cur ? deepCopy(cur) : undefined;
      }
    }),
  };
  const onsubmit = (e: UIEvent) => {
    e.preventDefault();
    const { asset, files } = state;
    TrialSvc.saveAsset(asset, files);
  };

  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { asset, files, original } = state;
      if (!asset) {
        return undefined;
      }
      const hasChanged = (files && files.length > 0) || !deepEqual(asset, original);

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
                    onchange: (v: string) => (asset.alias = v),
                    label: 'Name',
                    iconName: 'title',
                    contentClass: 'col s12 m6',
                  }),
                  m(TextInput, {
                    id: 'file',
                    initialValue: asset.filename,
                    disabled: true,
                    label: 'File',
                    iconName: 'attach_file',
                    contentClass: 'col s12 m6',
                  }),
                  m(FileInput, {
                    placeholder: 'Select or replace the file',
                    onchange: (fl: FileList) => (state.files = fl),
                  }),
                  asset.mimetype.indexOf('image/') === 0 && asset.url
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
                m('row', [
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
                        // TODO Delete asset
                        // await TrialSvc.deleteAsset(asset);
                        // const stakeholders = TrialSvc.getAssets();
                        // const cur = stakeholders && stakeholders.length > 0 ? stakeholders[0] : undefined;
                        // if (cur) {
                        //   assetsChannel.publish(TopicNames.ITEM_SELECT, { cur });
                        // } else {
                        //   assetsChannel.publish(TopicNames.ITEM_DELETE, { cur: asset });
                        // }
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
