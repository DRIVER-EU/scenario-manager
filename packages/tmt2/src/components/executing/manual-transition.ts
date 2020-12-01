import m from 'mithril';
import {
  InjectState,
  InjectConditionType,
  IExecutingInject,
  InjectType,
  MessageType,
  deepCopy,
  TimeState,
} from '../../../../models';
import { FlatButton, ModalPanel, Select, TextArea, TextInput } from 'mithril-materialized';
import { IExe, MeiosisComponent } from '../../services';
import { messageOptions, getMessageIcon, getActiveTrialInfo, uniqueId } from '../../utils';

export const ManualTransition: MeiosisComponent<{ editing?: (v: boolean) => void }> = () => {
  let show = true;
  let isEditing = false;
  let msgOptions = [] as Array<{ id: string; label: string }>;
  let newInject = {} as IExecutingInject;
  let version = 0;

  const waitingForManualConfirmation = (inject: IExecutingInject) =>
    inject.state === InjectState.SCHEDULED &&
    inject.condition &&
    inject.condition.type === InjectConditionType.MANUALLY;

  return {
    oninit: ({ attrs: { state } }) => {
      const { trial } = getActiveTrialInfo(state);
      const selectedMessageTypes = trial.selectedMessageTypes;
      msgOptions = messageOptions(selectedMessageTypes);
    },
    view: ({ attrs: { state, actions, options } }) => {
      const { inject, scenario } = getActiveTrialInfo<IExecutingInject>(state);
      const { time } = state.exe;
      const { startTime = 0 } = state.exe;
      const { updateExecutingInject, createInject, transitionInject, update } = actions;
      if (!inject) return;

      const { id, state: from } = inject;
      const isWaiting = waitingForManualConfirmation(inject);

      const send = async () => {
        show = false;
        const scenarioStart = scenario && scenario.startDate && new Date(scenario.startDate);
        if (scenarioStart) {
          const t = new Date(scenarioStart);
          t.setSeconds(t.getSeconds() + startTime);
          inject.expectedExecutionTimeAt = t;
        }

        await transitionInject({
          id,
          from,
          to: InjectState.IN_PROGRESS,
          expectedExecutionTimeAt: inject.expectedExecutionTimeAt
            ? inject.expectedExecutionTimeAt.valueOf()
            : undefined,
        });
        show = true;
      };

      return m('.row', [
        show &&
          !isEditing &&
          time.state !== TimeState.Paused &&
          inject.type === InjectType.INJECT &&
          (isWaiting
            ? m(FlatButton, {
                className: 'right red-text',
                iconName: 'check_circle',
                iconClass: 'red-text right',
                label: 'Click here when ready',
                onclick: send,
              })
            : m(FlatButton, {
                className: 'right',
                iconName: 'send',
                iconClass: 'right',
                label: inject.state === InjectState.EXECUTED ? 'Resend' : 'Send now',
                onclick: send,
              })),
        options &&
          options.editing &&
          inject.type !== InjectType.SCENARIO &&
          m(FlatButton, {
            className: 'right',
            iconName: 'edit',
            iconClass: 'right',
            label: isEditing ? 'Stop editing' : 'Edit',
            onclick: () => {
              isEditing = !isEditing;
              options && options.editing && options.editing(isEditing);
              if (!isEditing) {
                show = true;
                updateExecutingInject(inject);
              }
            },
          }),
        show &&
          inject.type === InjectType.ACT && [
            m(FlatButton, {
              modalId: 'add-modal',
              className: 'right',
              iconName: 'add',
              iconClass: 'right',
              label: 'Message',
            }),
            m(ModalPanel, {
              options: {
                onCloseEnd: () => {
                  version++;
                  newInject.messageType = undefined;
                },
              },
              fixedFooter: true,
              onCreate: (modal) => {
                modal.options.endingTop = '5%';
                // const scenarioStart = scenario && scenario.startDate ? new Date(scenario.startDate) : scenarioStartTime;
                // const t = new Date(scenarioStart.valueOf());
                // t.setSeconds(scenarioStart.getSeconds() + startTime);
                // inject.expectedExecutionTimeAt = t;

                newInject = {
                  id: uniqueId(),
                  type: InjectType.INJECT,
                  parentId: inject.id,
                  condition: {
                    type: InjectConditionType.MANUALLY,
                    injectId: inject.id,
                    injectState: InjectState.SCHEDULED,
                    delayUnitType: 'seconds',
                    //rolePlayerId:
                  },
                } as IExecutingInject;
              },
              id: 'add-modal',
              title: 'Add a new message',
              description: m('div', [
                m(Select, {
                  key: 'select' + version,
                  iconName: getMessageIcon(newInject.messageType),
                  placeholder: 'Select the message type',
                  isMandatory: true,
                  checkedId: newInject.messageType,
                  options: msgOptions,
                  fixedFooter: true,
                  onchange: (v) => {
                    newInject.messageType = v[0] as MessageType;
                  },
                }),
                m(TextInput, {
                  key: 'title' + version,
                  label: 'Title',
                  iconName: 'text',
                  isMandatory: true,
                  onchange: (v) => {
                    newInject.title = v;
                  },
                }),
                m(TextArea, {
                  key: 'desc' + version,
                  label: 'Description',
                  iconName: 'desc',
                  onchange: (v) => {
                    newInject.description = v;
                  },
                }),
              ]),
              buttons: [
                { label: 'Cancel' },
                {
                  label: 'Create',
                  disabled: !(newInject.title && newInject.messageType),
                  onclick: async () => {
                    isEditing = true;
                    options && options.editing && options.editing(isEditing);
                    const scenarioStart = scenario && scenario.startDate ? new Date(scenario.startDate) : undefined;
                    const relativeStartTime =
                      scenarioStart && time.simulationTime ? (time.simulationTime - scenarioStart.valueOf()) / 1000 : 0;
                    const delay = relativeStartTime - (startTime || 0);
                    if (newInject.condition) newInject.condition.delay = delay;
                    console.table(newInject);
                    update({ exe: { startTime: relativeStartTime } as IExe });
                    await createInject(deepCopy(newInject));
                  },
                },
              ],
            }),
          ],
      ]);
    },
  };
};
