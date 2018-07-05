import m from 'mithril';
import { inputText } from '../utils/html';
import { AppState } from '../models/app-state';
import { roundIconButton } from '../utils/html';
import { IScenario } from '../models/scenario';
import { ScenarioSvc } from '../services/scenario-service';

export const ScenarioList = () => {
  const state = {
    filterValue: '',
  };
  const titleFilter = (contains: string) => (scenario: IScenario) =>
    !contains || !scenario.title || scenario.title.indexOf(contains) >= 0;
  return {
    oncreate: () => ScenarioSvc.loadList(),
    view: () => {
      return m('.row', [
        m('.row', [
          roundIconButton({
            iconName: 'add',
            ui: { class: 'green input-field right', href: '/scenario', oncreate: m.route.link },
          }),
          inputText({
            label: 'Filter',
            id: 'filter',
            iconName: 'filter_list',
            initialValue: state.filterValue,
            onchange: (v: string) => state.filterValue = v,
            style: 'margin-right:100px',
            classNames: 'right',
          }),
        ]),
        m(
          '.row',
          ScenarioSvc.list.filter(titleFilter(state.filterValue)).map((scenario) =>
            m('.col.s6.m4.l3', [
              m(
                '.card',
                m('.card-content', { style: 'height: 150px' }, [
                  m(
                    'span.card-title',
                    m(
                      'a',
                      {
                        href: '/scenario/' + scenario.id,
                        oncreate: m.route.link,
                        onclick: (AppState.scenarioLoaded = true),
                      },
                      (scenario.title || 'Untitled').toUpperCase()
                    )
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
