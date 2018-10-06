import m, { Component } from 'mithril';
import M from 'materialize-css';
import { ObjectiveSvc } from '../../services/objective-service';
import { ScenarioSvc } from '../../services/scenario-service';

export const DropDownObjectives = () => {
  const state = {
    scenarioId: '',
    id: Math.round(Math.random() * 1000000),
    objectives: ObjectiveSvc.getList(),
  };

  const initDropDown = () => {
    if (state.objectives.length === 0) {
      return;
    }
    const elems = document.querySelectorAll(`#dt${state.id}`);
    M.Dropdown.init(elems, { constrainWidth: false });
  };

  const style = 'margin: 3rem 0 0 3rem; width: 92%; width: calc(100% - 3rem);';
  const linkStyle = 'width: 100%; margin-top: 3rem;';

  return {
    oninit: () => {
      if (state.objectives.length > 0) {
        return;
      }
      const loadObjectives = async () => {
        const scenario = ScenarioSvc.getCurrent();
        state.scenarioId = scenario.id;
        if (scenario && scenario.id) {
          state.objectives = await ObjectiveSvc.loadListInScenario(scenario.id);
        }
      };
      loadObjectives();
    },
    oncreate: initDropDown,
    onupdate: initDropDown,
    view: ({ attrs }) => {
      const { objectiveId, title, onchange } = attrs;
      const objectives = state.objectives;
      const selected = objectives.filter(o => o.id === objectiveId).shift();
      return m('.input-field', [
        m('i.material-icons.prefix', 'my_location'),
        m('label', title),
        m(
          `a.dropdown-trigger.btn[id=dt${
            state.id
          }][href=#][data-target=dropdown${state.id}]`,
          { style: linkStyle },
          selected ? selected.title : 'SELECT'
        ),
        m(
          `ul.dropdown-content[id=dropdown${state.id}]`,
          { style },
          objectives.map(o =>
            m(
              'li',
              m(
                'button.waves-effect.waves-teal.btn-flat',
                {
                  onclick: (e: UIEvent) => {
                    e.preventDefault();
                    onchange(o.id);
                  },
                },
                o.title
              )
            )
          )
        ),
      ]);
    },
  } as Component<{
    title: string;
    objectiveId?: string;
    onchange: (objectiveId: string) => void;
  }>;
};
