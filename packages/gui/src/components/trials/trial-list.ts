import m from 'mithril';
import { TextInput, RoundIconButton } from 'mithril-materialized';
import { TrialSvc, dashboardSvc } from '../../services';
import { titleAndDescriptionFilter } from '../../utils';
import { ITrial } from 'trial-manager-models';
import { Dashboards } from '../../models/dashboards';

export const TrialList = () => {
  const state = {
    filterValue: undefined as string | undefined,
  };
  return {
    oninit: () => TrialSvc.loadList(),
    view: () => {
      const trials = TrialSvc.getList();
      const query = titleAndDescriptionFilter(state.filterValue);
      const filteredScenarios = trials.filter(query);
      return m('.scenario-list', [
        m('.row', [
          m(RoundIconButton, {
            iconName: 'add',
            class: 'green input-field right',
            onclick: () => {
              TrialSvc.new({
                title: 'New trial',
                creationDate: new Date(),
              } as ITrial);
              dashboardSvc.switchTo(Dashboards.TRIAL_INFO);
            },
          }),
          m(TextInput, {
            label: 'Filter',
            id: 'filter',
            iconName: 'filter_list',
            onkeyup: (ev: KeyboardEvent, v?: string) => (state.filterValue = v),
            style: 'margin-right:100px',
            contentClass: 'right',
          }),
        ]),
        m(
          '.row',
          filteredScenarios.map(scenario =>
            m('.col.s6.m4.l3', [
              m(
                '.card',
                m('.card-content', { style: 'height: 150px' }, [
                  m(
                    'a[href=#].card-title',
                    {
                      onclick: () => {
                        console.log('Set scenario to ' + scenario.title);
                        return TrialSvc.load(scenario.id);
                      },
                    },
                    scenario.title || 'Untitled'
                  ),
                  m('p', scenario.description),
                ])
              ),
            ])
          )
        ),
      ]);
    },
  };
};
