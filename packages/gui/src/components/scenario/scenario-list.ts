import m from 'mithril';
import { FlatButton, TextInput, RoundIconButton } from 'mithril-materialized';
import { ScenarioSvc } from '../../services/scenario-service';
import { titleAndDescriptionFilter } from '../../utils/utils';

export const ScenarioList = () => {
  const state = {
    filterValue: '',
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
            onchange: (v: string) => (state.filterValue = v),
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
                    'span.card-title',
                    m(FlatButton, {
                      label: scenario.title || 'Untitled',
                      onclick: () => {
                        // tslint:disable-next-line:no-console
                        console.log('Set scenario to ' + scenario.title);
                        // store.dispatch(updateScenario(scenario));
                        return ScenarioSvc.load(scenario.id);
                      },
                    })
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
