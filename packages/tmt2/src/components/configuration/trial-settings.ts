import m from 'mithril';
import { MeiosisComponent } from '../../services';

export const TrialSettings: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { trial },
        },
      },
    }) => {
      return m('div', trial.title);
      // const hasChanged = !deepEqual(trial, TrialSvc.getCurrent());
      // return m('.row', [
      //   m('.col.s12', [
      //     m('.row.topics', m(TopicsSettings, { trial })),
      //     m('.row.buttons', [
      //       m(Button, {
      //         label: 'Undo',
      //         iconName: 'undo',
      //         class: `green ${hasChanged ? '' : 'disabled'}`,
      //         onclick: () => (state.trial = deepCopy(TrialSvc.getCurrent())),
      //       }),
      //       ' ',
      //       m(Button, {
      //         label: 'Save',
      //         iconName: 'save',
      //         class: `green ${hasChanged ? '' : 'disabled'}`,
      //         onclick: onsubmit,
      //       }),
      //       ' ',
      //       m(Button, {
      //         label: 'Close',
      //         iconName: 'close',
      //         onclick: (e: UIEvent) => close(e),
      //       }),
      //       ' ',
      //       m(Button, {
      //         label: 'Delete',
      //         iconName: 'delete',
      //         class: 'red',
      //         onclick: (e: UIEvent) => {
      //           TrialSvc.delete(trial.id);
      //           close(e);
      //         },
      //       }),
      //     ]),
      //   ]),
      // ]);
    },
  };
};
