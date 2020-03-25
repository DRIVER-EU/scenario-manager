import m from 'mithril';
import { Button } from 'mithril-materialized';
import { TrialSvc } from '../../services';
import { ITrial, deepCopy, deepEqual } from '../../../../models';
import { TopicsSettings } from './topics/topics-settings';

const log = console.log;
const close = async (e: UIEvent) => {
  log('closing...');
  await TrialSvc.unload();
  m.route.set('/');
  e.preventDefault();
};

export const TrialSettings = () => {
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
      return m('.row', [
        m('.col.s12', [
          m('.row.topics', m(TopicsSettings, { trial })),
          m('.row.buttons', [
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
        ]),
      ]);
    },
  };
};
