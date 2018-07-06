import { M } from '../app';
import m from 'mithril';
import { roundIconButton, inputTextArea, inputText } from '../utils/html';
import { ScenarioSvc } from '../services/scenario-service';
import { updateScenario, deleteScenario } from './../store/actions';
import { store } from './../store/store';

const log = console.log;
const close = () => {
  store.dispatch(deleteScenario());
  m.route.set('/');
};

export const ScenarioForm = () => {
  return {
    oninit: () => {
      log('On INIT');
      const scenario = store.getState().scenario;
      if (!scenario || !scenario.id) {
        log('On INIT: NEW');
        ScenarioSvc.new();
      }
      // M.updateTextFields();
    },
    // vnode.attrs.editing ? ScenarioSvc.load(vnode.attrs.id) : ScenarioSvc.new(),
    // onupdate: () => {
    //   log('On update');
    //   M.updateTextFields();
    // },
    view: () => {
      const scenario = store.getState().scenario;
      return m(
        '.row',
        { style: 'color: black' },
        m(
          'form.col.s12',
          {
            onsubmit: async (e: MouseEvent) => {
              log('submitting...');
              e.preventDefault();
              const curScenario = store.getState().scenario;
              const newScenario = curScenario && curScenario.id ? await ScenarioSvc.save() : await ScenarioSvc.create();
              if (newScenario) {
                store.dispatch(updateScenario(newScenario));
              }
            },
          },
          [
            m('.row', [
              [
                inputText({
                  id: 'title',
                  initialValue: scenario.title,
                  onchange: (v: string) => (scenario.title = v),
                  label: 'Title',
                  iconName: 'title',
                }),
                inputTextArea({
                  id: 'desc',
                  initialValue: scenario.description,
                  onchange: (v: string) => (scenario.description = v),
                  label: 'Description',
                  iconName: 'description',
                }),
              ],
            ]),
            m('row.inline', [
              roundIconButton({ iconName: 'save', ui: { class: 'green', type: 'submit' } }),
              roundIconButton({ iconName: 'close', ui: { class: 'green', onclick: () => close() } }),
              roundIconButton({
                iconName: 'delete',
                ui: {
                  class: 'red', onclick: () => {
                    ScenarioSvc.delete(scenario.id);
                    close();
                  },
                },
              }),
            ]),
          ]
        )
      );
    },
  };
};
