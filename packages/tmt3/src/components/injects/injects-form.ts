import m, { FactoryComponent, Attributes } from 'mithril';
import { Icon, Dropdown, Select, FloatingActionButton } from 'mithril-materialized';
import {
  getInjectIcon,
  isScenario,
  isStoryline,
  isInject,
  isInjectGroup,
  canDeleteInject,
  getInjects,
  getObjectives,
  getMessageIconFromTemplate,
  getActiveTrialInfo,
} from '../../utils';
import {
  IInject,
  InjectType,
  IInjectGroup,
  deepCopy,
  MessageType,
  getAllChildren,
  uniqueId,
  ITrial,
  IKafkaMessage,
} from 'trial-manager-models';
import { InjectConditions } from './inject-conditions';
import { MessageForm } from '../messages';
import { actions, MeiosisComponent } from '../../services';

export interface IInjectsForm extends Attributes {
  disabled?: boolean;
}

export const InjectsForm: MeiosisComponent<{ editing: boolean }> = () => {
  let inject: IInject;
  let copiedInjectIsCut = false;
  let copiedInjects = undefined as undefined | IInject | IInject[];
  let messageOpt: Array<{
    id: string;
    label: string;
  }>;
  let getMessageIcon: (topic?: string) => string;

  /**
   * Create a deep copy of all injects, give them a new ID, and map their parent IDs
   * to keep the hierarchy intact.
   */
  const createFreshInjects = (injects: IInject[], oldParentId: string, newParentId: string) => {
    const idMap = {} as { [key: string]: string };
    idMap[oldParentId] = newParentId;
    return injects
      .map(deepCopy)
      .map((c) => {
        const id = uniqueId();
        idMap[c.id] = id;
        c.id = id;
        return c;
      })
      .map((c) => {
        if (c.parentId && idMap.hasOwnProperty(c.parentId)) {
          c.parentId = idMap[c.parentId];
        }
        return c;
      });
  };

  const canPasteInject = () => {
    const copy = copiedInjects instanceof Array ? copiedInjects[0] : copiedInjects;
    if (!inject || !copy) {
      return false;
    }
    if (isScenario(inject)) {
      return isScenario(copy) || isStoryline(copy);
    }
    if (isStoryline(inject)) {
      return isInject(copy) || isStoryline(copy);
    }
    if (isInject(inject)) {
      return isInject(copy);
    }
    return false;
  };

  return {
    oninit: ({ attrs: { state } }) => {
      const {
        app: { templates },
      } = state;
      getMessageIcon = getMessageIconFromTemplate(templates);
      const { trial } = getActiveTrialInfo(state);
      //messageOpt = templates.map((t) => ({ id: t.topic, label: t.label }));
      messageOpt = trial.selectedMessageTypes.map((t) => ({ id: t.id, label: t.name }));
      // const { trial } = getActiveTrialInfo(state);
      // const selectedMessageTypes = trial.selectedMessageTypes;
      // messageOpt = messageOptions(selectedMessageTypes);
    },
    view: ({ attrs: { state, actions, options } }) => {
      const { mode } = state.app;
      const isExecuting = mode === 'execute';
      const disabled = isExecuting;
      const { trial, injectId, scenarioId } = isExecuting && state.exe.trial.id ? state.exe : state.app;
      const { updateInject, createInject, createInjects, deleteInject } = actions;
      const selectedMessageTypes = trial.selectedMessageTypes;

      const id = injectId || scenarioId;
      const injects = getInjects(trial);
      const original = injects.filter((i) => i.id === id).shift();
      if (!original) {
        return;
      }
      if (!inject || inject.id !== injectId) {
        inject = deepCopy(original);
      }

      const newInject = (i: IInject) => {
        if (injects) {
          i.id = i.id || uniqueId();
          injects.push(i);
        }
        return i;
      };

      // TODO Sometimes after a copy, two identical injects are created. Why?
      const pasteInject = async (inject: IInject) => {
        if (!inject || !copiedInjects) {
          return;
        }
        const copy = copiedInjects instanceof Array ? copiedInjects[0] : copiedInjects;
        const newParentId = inject.id as string;
        if (copiedInjectIsCut) {
          if (isInject(copy)) {
            // Paste copied inject: only injects can be cut, not acts etc.
            if (isInject(inject)) {
              copy.parentId = inject.parentId;
            }
            newInject(copy);
            await updateInject(copy);
          }
        } else if (copiedInjects instanceof Array) {
          const isParentChildRelation =
            (isScenario(inject) && isStoryline(copy)) || (isStoryline(inject) && isInject(copy)) || isInject(copy);
          const isSiblingRelation =
            (isScenario(inject) && isScenario(copy)) || (isStoryline(inject) && isStoryline(copy));
          if (isParentChildRelation) {
            createInjects(createFreshInjects(copiedInjects, copy.parentId!, newParentId));
          } else if (isSiblingRelation) {
            createInjects(createFreshInjects(copiedInjects, copy.parentId!, copy.parentId!));
          } else if (isInject(inject) && isInject(copy)) {
            const clone = deepCopy(copy);
            clone.id = uniqueId();
            clone.parentId = inject.parentId;
            await createInject(clone);
          }
        }
      };

      const cutInject = async (inject: IInject) => {
        if (inject) {
          copiedInjectIsCut = true;
          copiedInjects = inject;
          await deleteInject(inject);
        }
      };

      const copyInject = async (inject: IInject) => {
        if (inject) {
          copiedInjectIsCut = false;
          copiedInjects = [inject, ...getAllChildren(getInjects(trial) || [], inject.id as string)];
        }
      };

      const cloneInject = async (inject: IInject) => {
        if (inject) {
          await copyInject(inject);
          await pasteInject(inject);
        }
      };
      const canDelete = inject && canDeleteInject(trial, inject);

      const canPaste = canPasteInject();

      return m(
        '.row.injects-form.sb.large',
        // { className },
        m(
          '.col.s12',
          {
            key: inject.id,
            style: 'color: #b4790c',
          },
          [
            options?.editing &&
              m(FloatingActionButton, {
                className: 'red',
                iconName: 'add',
                direction: 'left',
                position: 'right',
                buttons: [
                  {
                    iconName: 'delete',
                    className: `red ${canDelete ? '' : ' disabled'}`,
                    onClick: async () => await deleteInject(inject),
                  },
                  {
                    iconName: 'content_cut',
                    className: `red ${canDelete ? '' : ' disabled'}`,
                    onClick: async () => await cutInject(inject),
                  },
                  {
                    iconName: 'content_paste',
                    className: `red ${canPaste ? '' : ' disabled'}`,
                    onClick: async () => await pasteInject(inject),
                  },
                  { iconName: 'content_copy', className: 'green', onClick: () => copyInject(inject) },
                  { iconName: 'add', className: 'blue', onClick: () => cloneInject(inject) },
                ],
              }),
            m(
              '.row',
              inject.type === InjectType.INJECT
                ? m(Select, {
                    disabled,
                    iconName: getMessageIcon(inject.topic),
                    placeholder: 'Select the message type',
                    checkedId: inject.topicId,
                    options: messageOpt,
                    onchange: (v) => {
                      // console.warn('Getting message form');
                      const selMsg = selectedMessageTypes.find((msg: IKafkaMessage) => msg.id === v[0]);
                      inject!.selectedMessage = selMsg;
                      inject!.topic = selMsg?.messageForm as MessageType;
                      inject!.topicId = v[0] as string;
                      inject!.kafkaTopic = selMsg?.kafkaTopic as string;
                      updateInject(inject);
                    },
                  })
                : m('h4', [
                    m(Icon, {
                      iconName: getInjectIcon(inject.type),
                      class: 'small',
                      style: 'margin-right: 12px;',
                    }),
                    inject.type,
                  ])
            ),
            [
              (inject.topic || isInjectGroup(inject)) && m(InjectConditions, { state, actions, options }),
              m(MessageForm, { state, actions, options }),
              // : m('div#dummy'),
              m(SetObjectives, { trial, disabled, inject }),
            ],
          ]
        )
      );
    },
  };
};

/** Allows to set the main and secondary objective */
export const SetObjectives: FactoryComponent<{ trial: ITrial; inject: IInject; disabled?: boolean }> = () => {
  return {
    view: ({ attrs: { trial, inject, disabled = false } }) => {
      const isGroup = inject && inject.type !== InjectType.INJECT;
      const objectives = [{ id: '', title: 'Pick one' }, ...(getObjectives(trial) || [])].map((o) => ({
        id: o.id,
        label: o.title,
      }));
      const injectGroup = inject as IInjectGroup;
      const hasObjectives = () =>
        objectives.length > 1 &&
        (injectGroup.mainObjectiveId || injectGroup.secondaryObjectiveId) &&
        objectives.filter((o) => o.id === injectGroup.mainObjectiveId || o.id === injectGroup.secondaryObjectiveId)
          .length > 0;

      const getInjectGroup = () => {
        return injectGroup;
      };

      return isGroup && !(disabled && !hasObjectives())
        ? m('.row', [
            m(Dropdown, {
              key: inject.id + 'primary',
              disabled,
              id: 'primary' + inject.id,
              className: 'col s6',
              helperText: 'Main objective',
              checkedId: getInjectGroup().mainObjectiveId,
              items: objectives,
              onchange: (id: string | number) => {
                if (id !== 'Pick one') {
                  const ijg = getInjectGroup();
                  ijg.mainObjectiveId = id as string;
                  actions.updateInject(ijg);
                }
              },
            }),
            injectGroup.mainObjectiveId &&
              m(Dropdown, {
                key: inject.id + 'secondary',
                disabled,
                id: 'secondary' + inject.id,
                className: 'col s6',
                helperText: 'Secondary objective',
                checkedId: getInjectGroup().secondaryObjectiveId,
                items: objectives,
                onchange: (id: string | number) => {
                  if (id !== 'Pick one') {
                    const ijg = getInjectGroup();
                    ijg.secondaryObjectiveId = id as string;
                    actions.updateInject(ijg);
                  }
                },
              })
          ].filter(Boolean))
        : undefined;
    },
  };
};
