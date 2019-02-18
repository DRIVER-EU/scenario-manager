import m, { FactoryComponent } from 'mithril';
import { AssetsForm } from './assets-form';
import { TrialSvc } from '../../services';
import { IStakeholder, ITrial, IAsset } from 'trial-manager-models';
import { assetsChannel, TopicNames } from '../../models';
import { RoundIconButton, TextInput, Collection, CollectionMode } from 'mithril-materialized';
import { assetIcon } from '../../utils';

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
  const selectAsset = (cur: IAsset) => () => {
    assetsChannel.publish(TopicNames.ITEM_SELECT, { cur });
    state.curAssetId = cur.id;
  };

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
      if (!state.curAssetId && filteredAssets.length > 0) {
        setTimeout(() => {
          selectAsset(filteredAssets[0])();
          m.redraw();
        }, 0);
      }
      const items = filteredAssets.map(cur => ({
        title: cur.alias || cur.filename,
        avatar: assetIcon(cur),
        iconName: 'file_download',
        className: 'yellow black-text',
        active: state.curAssetId === cur.id,
        href: cur.url,
        // content: (cur. ? `<br><i>${cur.notes}</i>` : ''),
        onclick: selectAsset(cur),
      }));

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
                m(Collection, { mode: CollectionMode.AVATAR, items })
                // m(
                //   'ul.collection',
                //   filteredAssets.map(cur =>
                //     m(
                //       'li.collection-item avatar',
                //       {
                //         class: state.curAssetId === cur.id ? 'active' : undefined,
                //         onclick: selectAsset(cur),
                //       },
                //       [
                //         m(Icon, {
                //           iconName: assetIcon(cur),
                //           class: 'circle yellow black-text',
                //         }),
                //         m('span.title', cur.alias || cur.filename),
                //         m(
                //           'p',
                //           m(
                //             'a.secondary-content[target=_blank]',
                //             { href: cur.url },
                //             m(Icon, { iconName: 'file_download' })
                //           )
                //         ),
                //       ]
                //     )
                //   )
                // )
              )
            )
          : undefined,
      ];
    },
  };
};

export const AssetsView = () => {
  return {
    view: () => m('.row', [m('.col.s12.m5.l4', m(AssetsList)), m('.col.s12.m7.l8', m(AssetsForm))]),
  };
};
