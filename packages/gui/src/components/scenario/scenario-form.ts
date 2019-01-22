import m from 'mithril';
import { Button, TextArea, TextInput } from 'mithril-materialized';
import { ScenarioSvc } from '../../services';
import { deepCopy, deepEqual } from '../../utils';
import { DateTimeControl } from './date-time-control';
import { IScenario } from '../../models';

const log = console.log;
const close = async (e: UIEvent) => {
  log('closing...');
  await ScenarioSvc.unload();
  m.route.set('/');
  e.preventDefault();
};

export const ScenarioForm = () => {
  const state = {
    scenario: {} as IScenario,
  };
  const onsubmit = async (e: MouseEvent) => {
    log('submitting...');
    e.preventDefault();
    if (state.scenario) {
      await ScenarioSvc.saveScenario(state.scenario);
      state.scenario = deepCopy(ScenarioSvc.getCurrent());
    }
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
    },
    view: () => {
      const { scenario } = state;
      const startDate = scenario.startDate || new Date();
      const endDate = scenario.endDate || new Date(startDate.valueOf());
      if (!scenario.endDate) {
        endDate.setHours(startDate.getHours() + 6);
        scenario.endDate = endDate;
      }
      const hasChanged = !deepEqual(scenario, ScenarioSvc.getCurrent());
      return m(
        '.row.scenario-form',
        { style: 'color: black' },
        m(
          'form.col.s12',
          [
            m('.row', [
              [
                m(TextInput, {
                  id: 'title',
                  initialValue: scenario.title,
                  onchange: (v: string) => (scenario.title = v),
                  label: 'Title',
                  iconName: 'title',
                }),
                m(TextArea, {
                  id: 'desc',
                  initialValue: scenario.description,
                  onchange: (v: string) => (scenario.description = v),
                  label: 'Description',
                  iconName: 'description',
                }),
                m(DateTimeControl, {
                  prefix: 'Start',
                  dt: startDate,
                  onchange: (d: Date) => {
                    state.scenario.startDate = d;
                    m.redraw();
                  },
                }),
                m(DateTimeControl, {
                  prefix: 'End',
                  icon: 'timer_off',
                  dt: endDate,
                  onchange: (d: Date) => {
                    state.scenario.endDate = d;
                    m.redraw();
                  },
                }),
              ],
            ]),
            m('row', [
              m(Button, {
                label: 'Undo',
                iconName: 'undo',
                class: `green ${hasChanged ? '' : 'disabled'}`,
                onclick: () => (state.scenario = deepCopy(ScenarioSvc.getCurrent())),
              }),
              ' ',
              m(Button, {
                label: 'Save',
                iconName: 'save',
                class: `green ${hasChanged ? '' : 'disabled'}`,
                onclick: onsubmit,
              }),
              ' ',
              m(Button, {
                label: 'Close',
                iconName: 'close',
                onclick: (e: UIEvent) => close(e),
              }),
              ' ',
              m(Button, {
                label: 'Delete',
                iconName: 'delete',
                class: 'red',
                onclick: (e: UIEvent) => {
                  ScenarioSvc.delete(scenario.id);
                  close(e);
                },
              }),
            ]),
          ]
        )
      );
    },
  };
};
