import m from 'mithril';
import { Button, TextArea, TextInput } from 'mithril-materialized';
import { TrialSvc } from '../../services';
import { ITrial, deepCopy, deepEqual } from 'trial-manager-models';

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
