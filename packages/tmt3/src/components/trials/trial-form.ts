import m from 'mithril';
import { Button, TextArea, TextInput, FileInput, ModalPanel } from 'mithril-materialized';
import { deepCopy, deepEqual, ITrial } from '../../../../models/dist';
import { Dashboards } from '../../models';
import { dashboardSvc, MeiosisComponent } from '../../services';

const close = async (e?: UIEvent) => {
  // await TrialSvc.unload();
  dashboardSvc.switchTo(Dashboards.HOME);
  if (e) {
    e.preventDefault();
  }
};

export const TrialForm: MeiosisComponent = () => {
  let trial: ITrial;
  // const onsubmit = async (e: MouseEvent) => {
  //   log('submitting...');
  //   e.preventDefault();
  //   if (state.trial) {
  //     await TrialSvc.saveTrial(state.trial);
  //     state.trial = deepCopy(TrialSvc.getCurrent());
  //   }
  // };
  const upload = (file: FileList) => {
    if (!file || file.length < 1) {
      return console.warn('File is undefined');
    }
    const body = new FormData();
    body.append('file', file[0]);

    m.request({
      method: 'POST',
      url: `${process.env.SERVER || location.origin}/repo/upload`,
      body,
    }).then(() => setTimeout(() => m.route.set(dashboardSvc.defaultRoute), 500));
  };

  return {
    oninit: ({
      attrs: {
        state: {
          app: { trial: curTrial },
        },
      },
    }) => {
      trial = deepCopy(curTrial);
    },
    view: ({
      attrs: {
        state: {
          app: { trial: curTrial },
        },
        actions: { saveTrial, deleteTrial },
      },
    }) => {
      trial.id = curTrial.id;
      const hasChanged = !deepEqual(trial, curTrial);
      return m('.row', [
        m('.col.s12', [
          m('h5', trial.id ? 'Trial' : 'Create new Trial'),
          m(
            '.col.s6.l8',
            m(TextInput, {
              id: 'title',
              initialValue: trial.title,
              onchange: (v: string) => (trial.title = v),
              label: 'Title',
              iconName: 'title',
            })
          ),
          m(
            '.col.s6.l4',
            m(TextInput, {
              id: 'id',
              initialValue: trial.id,
              label: 'ID',
              iconName: 'label',
              disabled: true,
            })
          ),
          m(
            '.col.s12',
            m(TextArea, {
              id: 'desc',
              initialValue: trial.description,
              onchange: (v: string) => (trial.description = v),
              label: 'Description',
              iconName: 'description',
            })
          ),
          trial.id
            ? undefined
            : m(
                '.row',
                m('.col.s12', [
                  m('h5', 'Upload an existing trial'),
                  m(FileInput, {
                    placeholder: 'Upload an existing Trial',
                    accept: ['.sqlite3', '.sqlite'],
                    style: 'margin-bottom: 20px',
                    onchange: upload,
                  }),
                ])
              ),
          m(
            '.row',
            m('.col.s12.buttons', [
              m(Button, {
                label: 'Undo',
                iconName: 'undo',
                class: `green ${hasChanged ? '' : 'disabled'}`,
                onclick: () => (trial = deepCopy(curTrial)),
              }),
              ' ',
              m(Button, {
                label: 'Save',
                iconName: 'save',
                class: `green ${hasChanged ? '' : 'disabled'}`,
                onclick: async () => {
                  await saveTrial(trial);
                },
              }),
              ' ',
              m(Button, {
                label: 'Close',
                iconName: 'close',
                onclick: (e: UIEvent) => close(e),
              }),
              ' ',
              m(Button, {
                modalId: 'delete-trial',
                label: 'Delete',
                iconName: 'delete',
                class: 'red',
              }),
            ])
          ),
        ]),
        m(ModalPanel, {
          id: 'delete-trial',
          title: `Delete trial`,
          description: `Do you really want to delete this Trial - there is no way back?`,
          options: { opacity: 0.7 },
          buttons: [
            {
              label: 'Delete',
              onclick: async () => {
                await deleteTrial(trial.id);
                close();
              },
            },
            {
              label: 'Discard',
            },
          ],
        }),
      ]);
    },
  };
};
