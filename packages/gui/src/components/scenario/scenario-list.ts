import m from 'mithril';
import { TextInput, RoundIconButton } from 'mithril-materialized';
import { ScenarioSvc } from '../../services/scenario-service';
import { titleAndDescriptionFilter } from '../../utils/utils';

export const ScenarioList = () => {
  const state = {
    filterValue: undefined as string | undefined,
  };
  return {
    oninit: () => ScenarioSvc.loadList(),
    view: () => {
      const scenarios = ScenarioSvc.getList();
      const query = titleAndDescriptionFilter(state.filterValue);
      const filteredScenarios = scenarios.filter(query);
      return m('.scenario-list', [
        m('.row', [
          m(RoundIconButton, {
            iconName: 'add',
            class: 'green input-field right',
            href: '/new_scenario',
            oncreate: m.route.link,
            onclick: () => {
              ScenarioSvc.new();
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
                        return ScenarioSvc.load(scenario.id);
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
