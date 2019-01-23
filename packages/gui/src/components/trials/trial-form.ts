import m from 'mithril';
import { Button, TextArea, TextInput } from 'mithril-materialized';
import { TrialSvc } from '../../services';
import { deepCopy, deepEqual } from '../../utils';
import { DateTimeControl } from '../ui/date-time-control';
import { ITrial } from '../../models';

const log = console.log;
const close = async (e: UIEvent) => {
  log('closing...');
  await TrialSvc.unload();
  m.route.set('/');
  e.preventDefault();
};

export const ScenarioForm = () => {
  const state = {
    scenario: {} as ITrial,
  };
  const onsubmit = async (e: MouseEvent) => {
    log('submitting...');
    e.preventDefault();
    if (state.scenario) {
      await TrialSvc.saveTrial(state.scenario);
      state.scenario = deepCopy(TrialSvc.getCurrent());
    }
  };
  return {
    oninit: () => {
      log('On INIT');
      log(state);
      const scenario = TrialSvc.getCurrent();
      if (!scenario || !scenario.id) {
        log('On INIT: NEW');
        state.scenario = deepCopy(TrialSvc.new());
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
      const hasChanged = !deepEqual(scenario, TrialSvc.getCurrent());
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
                onclick: () => (state.scenario = deepCopy(TrialSvc.getCurrent())),
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
                  TrialSvc.delete(scenario.id);
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
