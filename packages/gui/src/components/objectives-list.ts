import m from 'mithril';
import { flatButton, roundIconButton, inputText } from '../utils/html';
import { ObjectiveSvc } from '../services/objective-service';
import { IObjective } from '../models/objective';
import { store } from '../store/store';

export const ObjectivesList = () => {
  const state = {
    parentId: null as string | null,
    filterValue: '',
    scenarioId: '',
  };
  const titleFilter = (contains: string) => (objective: IObjective) =>
    !contains || !objective.title || objective.title.indexOf(contains) >= 0;
  return {
    oncreate: () => {
      const loadObjectives = () => {
        const scenario = store.getState().scenario;
        state.scenarioId = scenario.id;
        if (scenario && scenario.id) {
          ObjectiveSvc.loadListInScenario(scenario.id);
        }
      };
      // store.subscribe(() => loadObjectives());
      loadObjectives();
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
                  parentId: state.parentId,
                  scenarioId: state.scenarioId,
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
                          state.parentId = objective.id;
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
