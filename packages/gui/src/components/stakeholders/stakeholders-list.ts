import m, { FactoryComponent } from 'mithril';
import { StakeholdersForm } from './stakeholders-form';
import { ScenarioSvc } from '../../services';
import { IStakeholder, stakeholdersChannel, TopicNames } from '../../models';
import { RoundIconButton, TextInput, Icon } from 'mithril-materialized';
import { uniqueId } from '../../utils';

const StakeholdersList: FactoryComponent<IStakeholder> = () => {
  const state = {
    filterValue: '' as string | undefined,
    curStakeholderId: undefined as string | undefined,
    subscription: stakeholdersChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
      state.curStakeholderId = cur.id;
    }),
  };
  return {
    onremove: () => state.subscription.unsubscribe(),
    view: () => {
      const stakeholders = ScenarioSvc.getStakeholders(state.filterValue);
      return m('.row', [
        m(TextInput, {
          label: 'Filter',
          id: 'filter',
          iconName: 'filter_list',
          onkeyup: (ev: KeyboardEvent, v?: string) => (state.filterValue = v),
          contentClass: 'right',
        }),
        stakeholders
          ? m(
              '.row',
              m(
                '.col.s12',
                m(
                  'ul.collection',
                  stakeholders.map(cur =>
                    m(
                      'li.collection-item avatar',
                      {
                        class: state.curStakeholderId === cur.id ? 'active' : undefined,
                        onclick: () => {
                          stakeholdersChannel.publish(TopicNames.ITEM_SELECT, { cur });
                          state.curStakeholderId = cur.id;
                        },
                      },
                      [
                        m(Icon, {
                          iconName: 'person_outline',
                          class: 'circle yellow black-text',
                        }),
                        m('span.title', cur.name),
                        cur.contactIds
                          ? m(
                              'p',
                              cur.contactIds
                                .map(id => ScenarioSvc.getUserById(id))
                                .map(c => c && c.name)
                                .join(', ')
                            )
                          : undefined,
                      ]
                    )
                  )
                )
              )
            )
          : undefined,
        m(RoundIconButton, {
          iconName: 'add',
          class: 'green input-field right',
          onclick: async () => {
            const sh = {
              id: uniqueId(),
              name: 'New stakeholder',
            } as IStakeholder;
            state.curStakeholderId = sh.id;
            await ScenarioSvc.createStakeholder(sh);
          },
        }),
      ]);
    },
  };
};

export const StakeholdersView = () => {
  return {
    view: () => m('.row', [m('.col.s12.m4.l3', m(StakeholdersList)), m('.col.s12.m8.l9', m(StakeholdersForm))]),
  };
};
