import m, { FactoryComponent, Attributes } from 'mithril';
import { Icon, Dropdown, Select, FloatingActionButton } from 'mithril-materialized';
import {
  getInjectIcon,
  isScenario,
  isStoryline,
  isAct,
  isInject,
  isInjectGroup,
  canDeleteInject,
  getInjects,
  getObjectives,
  getMessageIconFromTemplate,
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
} from 'trial-manager-models';
import { InjectConditions } from './inject-conditions';
import { MessageForm } from '../messages';
import { MeiosisComponent } from '../../services';

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
      return isAct(copy) || isStoryline(copy);
    }
    if (isAct(inject)) {
      return isAct(copy) || isInject(copy);
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
      messageOpt = templates.map((t) => ({ id: t.topic, label: t.label }));
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
            if (isAct(inject)) {
              copy.parentId = newParentId;
            } else if (isInject(inject)) {
              copy.parentId = inject.parentId;
            }
            newInject(copy);
            await updateInject(copy);
          }
        } else if (copiedInjects instanceof Array) {
          const isParentChildRelation =
            (isScenario(inject) && isStoryline(copy)) ||
            (isStoryline(inject) && isAct(copy)) ||
            (isAct(inject) && isInject(copy));
          const isSiblingRelation =
            (isScenario(inject) && isScenario(copy)) ||
            (isStoryline(inject) && isStoryline(copy)) ||
            (isAct(inject) && isAct(copy));
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
            // key: inject.id,
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
                    checkedId: inject.topic,
                    options: messageOpt,
                    onchange: (v) => {
                      // console.warn('Getting message form');
                      inject!.topic = v[0] as MessageType;
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
              m(MessageForm, { state, actions, options }),
              (inject.topic || isInjectGroup(inject)) && m(InjectConditions, { state, actions, options }),
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

      return isGroup && !(disabled && !hasObjectives())
        ? m('.row', [
            m(Dropdown, {
              disabled,
              id: 'primary',
              className: 'col s6',
              helperText: 'Main objective',
              checkedId: injectGroup.mainObjectiveId,
              items: objectives,
              onchange: (id: string | number) => (injectGroup.mainObjectiveId = id as string),
            }),
            injectGroup.mainObjectiveId
              ? m(Dropdown, {
                  disabled,
                  id: 'secondary',
                  className: 'col s6',
                  helperText: 'Secondary objective',
                  checkedId: injectGroup.secondaryObjectiveId,
                  items: objectives,
                  onchange: (id: string | number) => (injectGroup.secondaryObjectiveId = id as string),
                })
              : undefined,
          ])
        : undefined;
    },
  };
};
