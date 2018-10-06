import m from 'mithril';
import { inputTextArea, inputText, button } from '../../utils/html';
import { ScenarioSvc } from '../../services/scenario-service';
import { IScenario } from '../../models/scenario';
import { deepCopy, deepEqual } from '../../utils/utils';
import { DateTimeControl } from './date-time-control';

const log = console.log;
const close = async (e: UIEvent) => {
  log('closing...');
  await ScenarioSvc.unload();
  m.route.set('/');
  e.preventDefault();
};

export const ScenarioForm = () => {
  const state = {
    original: undefined as IScenario | undefined,
    scenario: {} as IScenario,
  };
  return {
    oninit: () => {
      log('On INIT');
      log(state);
      const scenario = ScenarioSvc.getCurrent();
      if (!scenario || !scenario.id) {
        log('On INIT: NEW');
        state.scenario = deepCopy(ScenarioSvc.new());
      } else {
        state.scenario = deepCopy(scenario);
      }
      state.original = deepCopy(state.scenario);
    },
    view: () => {
      const scenario = state.scenario;
      const hasChanged = !deepEqual(scenario, state.original);
      return m(
        '.row.scenario-form',
        { style: 'color: black' },
        m(
          'form.col.s12',
          {
            onsubmit: async (e: MouseEvent) => {
              log('submitting...');
              e.preventDefault();
              if (scenario) {
                const s = deepCopy(scenario);
                delete s.version;
                delete s.updatedDate;
                await ScenarioSvc.save(s);
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
                m(DateTimeControl, {
                  prefix: 'Start',
                  dt: scenario.startDate || new Date(),
                  onchange: (d: Date) => (scenario.startDate = d),
                }),
                m(DateTimeControl, {
                  prefix: 'End',
                  icon: 'timer_off',
                  dt: scenario.endDate || new Date().setHours(new Date().getHours() + 6),
                  onchange: (d: Date) => (scenario.endDate = d),
                }),
              ],
            ]),
            m('row', [
              button({
                iconName: 'undo',
                ui: {
                  class: `green ${hasChanged ? '' : 'disabled'}`,
                  onclick: () =>
                    (state.scenario = deepCopy(state.original) as IScenario),
                },
              }),
              ' ',
              button({
                iconName: 'save',
                ui: {
                  class: `green ${hasChanged ? '' : 'disabled'}`,
                  type: 'submit',
                },
              }),
              ' ',
              button({
                iconName: 'close',
                ui: {
                  onclick: e => close(e),
                },
              }),
              ' ',
              button({
                iconName: 'delete',
                ui: {
                  class: 'red',
                  onclick: e => {
                    ScenarioSvc.delete(scenario.id);
                    close(e);
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
