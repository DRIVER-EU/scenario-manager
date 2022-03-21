import m from 'mithril';
import {
  InjectState,
  InjectConditionType,
  IExecutingInject,
  InjectType,
  MessageType,
  deepCopy,
  TimeState,
  IKafkaMessage,
} from 'trial-manager-models';
import { FlatButton, ModalPanel, Select, TextArea, TextInput } from 'mithril-materialized';
import { MeiosisComponent } from '../../services';
import { getMessageIconFromTemplate, getActiveTrialInfo, uniqueId } from '../../utils';

export const ManualTransition: MeiosisComponent<{ editing?: (v: boolean) => void }> = () => {
  let show = true;
  let isEditing = false;
  let msgOptions = [] as Array<{ id: string; label: string }>;
  let newInject = {} as IExecutingInject;
  let version = 0;
  let getMessageIcon: (topic?: string) => string;

  const waitingForManualConfirmation = (inject: IExecutingInject) =>
    inject.state === InjectState.SCHEDULED &&
    inject.condition &&
    inject.condition.type === InjectConditionType.MANUALLY;

  return {
    oninit: ({ attrs: { state } }) => {
      const {
        app: { templates },
      } = state;
      getMessageIcon = getMessageIconFromTemplate(templates);
      const { trial } = getActiveTrialInfo(state);
      msgOptions = trial.selectedMessageTypes.filter((t) => !t.useCustomGUI).map((t) => ({ id: t.id, label: t.name }));
    },
    view: ({ attrs: { state, actions, options } }) => {
      const { inject, scenario } = getActiveTrialInfo<IExecutingInject>(state);
      const { time, trial } = state.exe;
      const { startTime = 0 } = state.exe;
      const { updateExecutingInject, createInject, transitionInject } = actions;
      
      const selectedMessageTypes = trial.selectedMessageTypes;
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
          inject.type === InjectType.INJECT && [
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
                  newInject.topic = undefined;
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
                  parentId: inject.parentId,
                  condition: {
                    type: InjectConditionType.MANUALLY,
                    injectId: inject.parentId,
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
                  iconName: getMessageIcon(newInject.topic),
                  placeholder: 'Select the message type',
                  isMandatory: true,
                  checkedId: newInject.topic,
                  options: msgOptions,
                  fixedFooter: true,
                  onchange: (v) => {
                    const selMsg = selectedMessageTypes.find((msg: IKafkaMessage) => msg.id === v[0]);
                    newInject!.selectedMessage = selMsg;
                    newInject!.topic = selMsg?.messageForm as MessageType;
                    newInject!.topicId = v[0] as string;
                    newInject!.kafkaTopic = selMsg?.kafkaTopic as string;
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
                  disabled: !(newInject.title && newInject.topic),
                  onclick: async () => {
                    isEditing = true;
                    options && options.editing && options.editing(isEditing);
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
