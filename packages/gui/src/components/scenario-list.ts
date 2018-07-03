import { AppState } from './../models/app-state';
import m from 'mithril';
import { button, iconPrefix, roundIconButton } from '../utils/html';
import { IScenario, Scenario } from '../models/scenario';

export const ScenarioList = () => {
  const state = {
    filterValue: '',
    setValue: (v: string) => {
      state.filterValue = v;
    },
  };
  const titleFilter = (contains: string) => (scenario: IScenario) =>
    !contains || !scenario.title || scenario.title.indexOf(contains) >= 0;
  return {
    oncreate: () => Scenario.loadList(),
    view: () => {
      return m('.row', [
        m('.row', [
          roundIconButton(
            'add',
            ['green'],
            {},
            { class: 'input-field right', href: '/scenario', oncreate: m.route.link }
          ),
          m('.input-field.right', { style: 'margin-right:100px' }, [
            iconPrefix('filter_list'),
            m('input.validate[id=filter][type=text]', {
              oninput: m.withAttr('value', state.setValue),
              value: state.filterValue,
            }),
            m('label[for=filter]', 'Filter'),
          ]),
        ]),
        m(
          '.row',
          Scenario.list.filter(titleFilter(state.filterValue)).map((scenario) =>
            m('.col s6 m4 l3', [
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
