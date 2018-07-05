import { AppState } from './../models/app-state';
import m from 'mithril';
import { flatButton, roundIconButton, inputText } from '../utils/html';
import { ObjectiveSvc } from '../services/objective-service';
import { IObjective } from './../models/objective';
import { ScenarioSvc } from '../services/scenario-service';

export const ObjectivesList = () => {
  const state = {
    filterValue: '',
  };
  const titleFilter = (contains: string) => (objective: IObjective) =>
    !contains || !objective.title || objective.title.indexOf(contains) >= 0;
  return {
    oncreate: () => {
      if (ScenarioSvc.current) {
        ObjectiveSvc.loadListInScenario(ScenarioSvc.current.id);
      }
    },
    view: () => {
      return m('.row', [
        m('.row', [
          roundIconButton({
            iconName: 'add',
            ui: {
              class: 'green input-field right',
              onclick: () => {
                ObjectiveSvc.current = {
                  title: '',
                  description: '',
                  parentId: AppState.objectives.parent ? AppState.objectives.parent.id : null,
                  scenarioId: ScenarioSvc.current.id,
                } as IObjective;
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
          m('ul.col.s12', [
            m(
              'li',
              flatButton({
                label: 'root',
                ui: { onclick: () => ObjectiveSvc.new() },
              })
            ),
            m(
              'li',
              m(
                'ul.col.s12',
                ObjectiveSvc.list.filter(titleFilter(state.filterValue)).map((objective) =>
                  m(
                    'li',
                    flatButton({
                      label: objective.title,
                      ui: {
                        onclick: () => {
                          AppState.objectives.parent = objective;
                          ObjectiveSvc.current = objective;
                        },
                      },
                    })
                  )
                )
              )
            ),
          ])
        ),
      ]);
    },
  };
};
