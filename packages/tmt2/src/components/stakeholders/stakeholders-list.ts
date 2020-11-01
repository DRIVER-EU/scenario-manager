import m from 'mithril';
import { StakeholdersForm } from './stakeholders-form';
import { IStakeholder, uniqueId } from '../../../../models';
import { RoundIconButton, TextInput, Collection, CollectionMode } from 'mithril-materialized';
import { MeiosisComponent } from '../../services';
import { getStakeholders, getUserById } from '../../utils';

const StakeholdersList: MeiosisComponent = () => {
  let filterValue = '' as string | undefined;
  let curStakeholderId = undefined as string | undefined;

  return {
    view: ({
      attrs: {
        state: {
          app: { trial, stakeholderId },
        },
        actions: { selectStakeholder, createStakeholder },
      },
    }) => {
      const stakeholders = getStakeholders(trial, filterValue);
      curStakeholderId = stakeholderId;
      const items = stakeholders
        ? stakeholders.map((cur) => ({
            title: cur.name || '?',
            avatar: 'attach_money',
            iconName: 'create',
            className: 'yellow black-text',
            active: curStakeholderId === cur.id,
            content: cur.notes
              ? cur.notes +
                '<br>' +
                (cur.contactIds
                  ? cur.contactIds
                      .map((id) => getUserById(trial, id))
                      .map((c) => c && c.name)
                      .join(', ')
                  : '')
              : '',
            onclick: () => selectStakeholder(cur),
          }))
        : undefined;

      return [
        m(
          '.row',
          m('.col.s12', [
            m(RoundIconButton, {
              iconName: 'add',
              class: 'green right btn-small',
              style: 'margin: 1em;',
              onclick: async () => {
                const sh = {
                  id: uniqueId(),
                  name: 'New stakeholder',
                } as IStakeholder;
                curStakeholderId = sh.id;
                await createStakeholder(sh);
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
        items
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

export const StakeholdersView: MeiosisComponent = () => {
  return {
    view: ({ attrs: { state, actions } }) =>
      m('.row', [
        m('.col.s12.m5.l4', m(StakeholdersList, { state, actions })),
        m('.col.s12.m7.l8', m(StakeholdersForm, { state, actions })),
      ]),
  };
};
