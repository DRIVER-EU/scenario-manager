import { flatButton } from './../utils/html';
import m from 'mithril';
import { inputText, roundIconButton } from '../utils/html';
import { IScenario } from '../models/scenario';
import { ScenarioSvc } from '../services/scenario-service';
import { store } from '../store/store';
import { updateScenario } from './../store/actions';

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
            ui: {
              class: 'green input-field right',
              href: '/new_scenario',
              oncreate: m.route.link,
              onclick: () => {
                store.dispatch(updateScenario({} as IScenario));
              },
            },
          }),
          inputText({
            label: 'Filter',
            id: 'filter',
            iconName: 'filter_list',
            initialValue: state.filterValue,
            onchange: (v: string) => (state.filterValue = v),
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
                    flatButton({
                      label: scenario.title || 'Untitled',
                      ui: {
                        onclick: () => {
                          // tslint:disable-next-line:no-console
                          console.log('Set scenario to ' + scenario.title);
                          store.dispatch(updateScenario(scenario));
                          m.route.set('/scenario');
                        },
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
