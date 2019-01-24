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

export const TrialForm = () => {
  const state = {
    trial: {} as ITrial,
  };
  const onsubmit = async (e: MouseEvent) => {
    log('submitting...');
    e.preventDefault();
    if (state.trial) {
      await TrialSvc.saveTrial(state.trial);
      state.trial = deepCopy(TrialSvc.getCurrent());
    }
  };
  return {
    oninit: () => {
      log('On INIT');
      log(state);
      const trial = TrialSvc.getCurrent();
      state.trial = deepCopy(trial);
    },
    view: () => {
      const { trial } = state;
      const startDate = trial.startDate || new Date();
      const endDate = trial.endDate || new Date(startDate.valueOf());
      if (!trial.endDate) {
        endDate.setHours(startDate.getHours() + 6);
        trial.endDate = endDate;
      }
      const hasChanged = !deepEqual(trial, TrialSvc.getCurrent());
      return m(
        '.row.scenario-form',
        { style: 'color: black' },
        m('form.col.s12', [
          m('.row', [
            [
              m(TextInput, {
                id: 'title',
                initialValue: trial.title,
                onchange: (v: string) => (trial.title = v),
                label: 'Title',
                iconName: 'title',
              }),
              m(TextArea, {
                id: 'desc',
                initialValue: trial.description,
                onchange: (v: string) => (trial.description = v),
                label: 'Description',
                iconName: 'description',
              }),
              m(DateTimeControl, {
                prefix: 'Start',
                dt: startDate,
                onchange: (d: Date) => {
                  state.trial.startDate = d;
                  m.redraw();
                },
              }),
              m(DateTimeControl, {
                prefix: 'End',
                icon: 'timer_off',
                dt: endDate,
                onchange: (d: Date) => {
                  state.trial.endDate = d;
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
              onclick: () => (state.trial = deepCopy(TrialSvc.getCurrent())),
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
                TrialSvc.delete(trial.id);
                close(e);
              },
            }),
          ]),
        ])
      );
    },
  };
};
