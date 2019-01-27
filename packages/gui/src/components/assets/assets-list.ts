import m, { FactoryComponent } from 'mithril';
import { AssetsForm } from './assets-form';
import { TrialSvc } from '../../services';
import { IStakeholder, assetsChannel, TopicNames, IAsset, ITrial } from '../../models';
import { RoundIconButton, TextInput, Icon } from 'mithril-materialized';
import { uniqueId } from '../../utils';

const AssetsList: FactoryComponent<IStakeholder> = () => {
  const state = {
    trial: undefined as ITrial | undefined,
    filterValue: '' as string | undefined,
    curAssetId: undefined as number | undefined,
    subscription: assetsChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
      state.curAssetId = cur.id;
    }),
  };
  const aliasAndFilenameFilter = () => {
    const f = state.filterValue && state.filterValue.toLowerCase();
    return f
      ? (a: IAsset) =>
          (a.alias && a.alias.toLowerCase().indexOf(f) >= 0) || (a.filename && a.filename.toLowerCase().indexOf(f) >= 0)
      : () => true;
  };
  const assetToIcon = (asset: IAsset) =>
    asset.mimetype.indexOf('image/') === 0
      ? 'image'
      : asset.mimetype.indexOf('application/pdf') === 0
      ? 'picture_as_pdf'
      : asset.mimetype.indexOf('application/json') === 0
      ? 'code'
      : 'short_text';
  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      if (!state.trial || !TrialSvc.assets) {
        return;
      }
      const filteredAssets = TrialSvc.assets.filter(aliasAndFilenameFilter());
      return [
        m('.row', [
          m(RoundIconButton, {
            iconName: 'add',
            class: 'green right',
            onclick: async () => {
              await TrialSvc.newAsset();
            },
          }),
          m(TextInput, {
            label: 'Filter',
            id: 'filter',
            iconName: 'filter_list',
            onkeyup: (ev: KeyboardEvent, v?: string) => (state.filterValue = v),
            contentClass: 'right',
          }),
        ]),
        filteredAssets
          ? m(
              '.row.sb',
              m(
                '.col.s12',
                m(
                  'ul.collection',
                  filteredAssets.map(cur =>
                    m(
                      'li.collection-item avatar',
                      {
                        class: state.curAssetId === cur.id ? 'active' : undefined,
                        onclick: () => {
                          assetsChannel.publish(TopicNames.ITEM_SELECT, { cur });
                          state.curAssetId = cur.id;
                        },
                      },
                      [
                        m(Icon, {
                          iconName: assetToIcon(cur),
                          class: 'circle yellow black-text',
                        }),
                        m('span.title', cur.alias || cur.filename),
                        m(
                          'p',
                          m(
                            'a.secondary-content[target=_blank]',
                            { href: cur.url },
                            m(Icon, { iconName: 'file_download' })
                          )
                        ),
                      ]
                    )
                  )
                )
              )
            )
          : undefined,
      ];
    },
  };
};

export const AssetsView = () => {
  return {
    view: () => m('.row', [m('.col.s12.m4.l3', m(AssetsList)), m('.col.s12.m8.l9', m(AssetsForm))]),
  };
};
