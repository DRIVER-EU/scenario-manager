import m from 'mithril';
import { AssetsForm } from './assets-form';
import { IAsset } from '../../../../models';
import { RoundIconButton, TextInput, Collection, CollectionMode } from 'mithril-materialized';
import { assetIcon } from '../../utils';
import { MeiosisComponent } from '../../services';

const AssetsList: MeiosisComponent = () => {
  let filterValue = '' as string | undefined;

  const aliasAndFilenameFilter = () => {
    const f = filterValue && filterValue.toLowerCase();
    return f
      ? (a: IAsset) =>
          (a.alias && a.alias.toLowerCase().indexOf(f) >= 0) || (a.filename && a.filename.toLowerCase().indexOf(f) >= 0)
      : () => true;
  };

  return {
    view: ({
      attrs: {
        state: {
          app: { assets, assetId },
        },
        actions: { selectAsset, createAsset },
      },
    }) => {
      const filteredAssets = assets.filter(aliasAndFilenameFilter());
      const items = filteredAssets.map((cur) => ({
        title: cur.alias || cur.filename,
        avatar: assetIcon(cur),
        iconName: 'file_download',
        className: 'yellow black-text',
        active: assetId === cur.id,
        href: cur.url,
        // content: (cur. ? `<br><i>${cur.notes}</i>` : ''),
        onclick: () => {
          if (cur.id === assetId) return;
          selectAsset(cur);
        },
      }));

      return [
        m(
          '.row',
          m('.col.s12', [
            m(RoundIconButton, {
              iconName: 'add',
              class: 'green right btn-small',
              style: 'margin: 1em;',
              onclick: async () => {
                await createAsset({ alias: 'New_asset' } as IAsset);
              },
            }),
            m(TextInput, {
              label: 'Filter',
              id: 'filter',
              iconName: 'filter_list',
              onkeyup: (_: KeyboardEvent, v?: string) => (filterValue = v),
              className: 'right',
            }),
          ])
        ),
        filteredAssets
          ? m(
              '.row.sb',
              m(
                '.col.s12',
                m(Collection, {
                  mode: CollectionMode.AVATAR,
                  items,
                })
              )
            )
          : undefined,
      ];
    },
  };
};

export const AssetsView: MeiosisComponent = () => {
  return {
    view: ({ attrs: { state, actions } }) =>
      m('.row', [
        m('.col.s12.m5.l4', m(AssetsList, { state, actions })),
        m('.col.s12.m7.l8', m(AssetsForm, { state, actions })),
      ]),
  };
};
