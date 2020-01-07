import m, { FactoryComponent, Attributes } from 'mithril';
import { Icon, Dropdown, Select, FloatingActionButton } from 'mithril-materialized';
import {
  getInjectIcon,
  findPreviousInjects,
  getMessageIcon,
  isScenario,
  isStoryline,
  isAct,
  isInject,
  messageOptions,
  isInjectGroup,
} from '../../utils';
import { TrialSvc } from '../../services';
import {
  IInject,
  InjectType,
  IInjectGroup,
  deepCopy,
  deepEqual,
  getInject,
  MessageType,
  getAllChildren,
  uniqueId,
  IScenario,
  InjectKeys,
} from 'trial-manager-models';
import { TopicNames, injectsChannel, AppState } from '../../models';
import { InjectConditions } from './inject-conditions';
import { MessageForm } from '../messages/message-form';

export interface IInjectsForm extends Attributes {
  disabled?: boolean;
}

export const InjectsForm: FactoryComponent<IInjectsForm> = () => {
  const state = {
    parent: undefined as IInject | IInjectGroup | undefined,
    oldInject: undefined as IInject | undefined,
    inject: undefined as IInject | undefined,
    original: undefined as IInject | undefined,
    saving: undefined as boolean | undefined,
    subscription: injectsChannel.subscribe(TopicNames.ITEM, ({ cur }, envelope) => {
      if (Object.keys(cur).length === 0) {
        return;
      }
      if (!state.saving && state.inject && cur.id !== state.inject.id && !deepEqual(state.original, state.inject)) {
        state.oldInject = state.inject;
        TrialSvc.updateInject(state.oldInject);
      }
      state.saving = false;
      if (envelope.topic === TopicNames.ITEM_UPDATE && state.inject && state.inject.id !== cur.id) {
        return;
      }
      state.inject = cur ? deepCopy(cur) : undefined;
      state.original = cur ? deepCopy(cur) : undefined;
      state.parent = cur.parentId ? getInject(cur.parentId, TrialSvc.getInjects()) : undefined;
      // console.log(cur);
      // m.redraw();
    }),
  };

  const onsubmit = async () => {
    const { inject } = state;
    if (inject) {
      await TrialSvc.updateInject(inject);
      state.saving = true;
    }
  };

  const onChange = (inj: IInject, props: InjectKeys) => {
    const { inject } = state;
    if (!inject) {
      return;
    }
    const applyChange = (prop: InjectKeys) => {
      switch (prop) {
        case 'title':
          state.inject = { ...inject, title: inj.title };
          break;
        case 'description':
          state.inject = { ...inject, description: inj.description };
          break;
        case 'startDate':
          state.inject = { ...inject, startDate: (inj as IScenario).startDate } as IScenario;
          break;
        case 'endDate':
          state.inject = { ...inject, endDate: (inj as IScenario).endDate } as IScenario;
          break;
        case 'todoBefore':
          state.inject = { ...inject, todoBefore: (inj as IScenario).todoBefore } as IScenario;
          break;
        case 'todoAfter':
          state.inject = { ...inject, todoAfter: (inj as IScenario).todoAfter } as IScenario;
          break;
        case 'message':
          state.inject = { ...inject, message: inj.message };
          break;
        case 'condition':
          state.inject = { ...inject, condition: inj.condition };
          break;
      }
    };
    if (props instanceof Array) {
      props.forEach(prop => applyChange(prop));
    } else {
      applyChange(props);
    }
    // console.table(inj);
  };

  return {
    onremove: () => {
      state.subscription.unsubscribe();
    },
    view: ({ attrs: { className, disabled = false } }) => {
      const { inject, original } = state;

      const hasChanged = !deepEqual(inject, original);
      if (hasChanged) {
        onsubmit();
      }
      const previousInjects = findPreviousInjects(inject, TrialSvc.getInjects());
      const selectedMessageTypes = TrialSvc.getCurrent().selectedMessageTypes;
      const options = messageOptions(selectedMessageTypes);

      const canDelete = inject && TrialSvc.canDeleteInject(inject);

      const canPasteInject = () => {
        const copy = AppState.copiedInjects instanceof Array ? AppState.copiedInjects[0] : AppState.copiedInjects;
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
      };

      const canPaste = canPasteInject();

      const deleteInject = async () => {
        if (inject) {
          const { parentId } = inject;
          state.inject = undefined;
          const injects = TrialSvc.getInjects() || [];
          const parent = injects.filter(i => i.id === parentId).shift() || injects[0];
          await TrialSvc.deleteInject(inject);
          injectsChannel.publish(TopicNames.ITEM_SELECT, { cur: parent });
        }
      };

      /**
       * Create a deep copy of all injects, give them a new ID, and map their parent IDs
       * to keep the hierarchy intact.
       */
      const createFreshInjects = (injects: IInject[], oldParentId: string, newParentId: string) => {
        const idMap = {} as { [key: string]: string };
        idMap[oldParentId] = newParentId;
        return injects
          .map(deepCopy)
          .map(c => {
            const id = uniqueId();
            idMap[c.id] = id;
            c.id = id;
            return c;
          })
          .map(c => {
            if (c.parentId && idMap.hasOwnProperty(c.parentId)) {
              c.parentId = idMap[c.parentId];
            }
            return c;
          });
      };

      // TODO Sometimes after a copy, two identical injects are created. Why?
      const pasteInject = async () => {
        if (!inject || !AppState.copiedInjects) {
          return;
        }
        const { copiedInjects, copiedInjectIsCut } = AppState;
        const copy = copiedInjects instanceof Array ? copiedInjects[0] : copiedInjects;
        const newParentId = inject.id;
        if (copiedInjectIsCut && isInject(copy)) {
          // Paste copied inject: only injects can be cut, not acts etc.
          if (isAct(inject)) {
            copy.parentId = newParentId;
          } else if (isInject(inject)) {
            copy.parentId = inject.parentId;
          }
          TrialSvc.newInject(copy);
          await TrialSvc.updateInject(copy.parentId === newParentId ? inject : TrialSvc.getInject(copy.parentId));
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
            createFreshInjects(copiedInjects, copy.parentId!, newParentId).map(i => TrialSvc.newInject(i));
            await TrialSvc.updateInject(inject);
          } else if (isSiblingRelation) {
            createFreshInjects(copiedInjects.slice(1), copy.id, newParentId).map(i => TrialSvc.newInject(i));
            await TrialSvc.updateInject(inject);
          } else if (isInject(inject) && isInject(copy)) {
            copy.id = '';
            copy.parentId = inject.parentId;
            TrialSvc.newInject(copy);
            await TrialSvc.updateInject(copy);
          }
        }
      };

      const cutInject = async () => {
        if (inject) {
          AppState.copiedInjectIsCut = true;
          AppState.copiedInjects = inject;
          deleteInject();
        }
      };

      const copyInject = async () => {
        if (inject) {
          AppState.copiedInjectIsCut = false;
          AppState.copiedInjects = [inject, ...getAllChildren(TrialSvc.getInjects() || [], inject.id)];
        }
      };

      const cloneInject = async () => {
        if (inject) {
          await copyInject();
          await pasteInject();
        }
      };

      return m(
        '.row.injects-form.sb.large',
        { className },
        inject
          ? m('.col.s12', { key: inject.id, style: 'color: #b4790c' }, [
              m(FloatingActionButton, {
                className: 'red',
                iconName: 'add',
                direction: 'left',
                position: 'right',
                buttons: [
                  {
                    iconName: 'delete',
                    className: `red ${canDelete ? '' : ' disabled'}`,
                    onClick: deleteInject,
                  },
                  {
                    iconName: 'content_cut',
                    className: `red ${canDelete ? '' : ' disabled'}`,
                    onClick: cutInject,
                  },
                  {
                    iconName: 'content_paste',
                    className: `red ${canPaste ? '' : ' disabled'}`,
                    onClick: async () => await pasteInject(),
                  },
                  { iconName: 'content_copy', className: 'green', onClick: copyInject },
                  { iconName: 'add', className: 'blue', onClick: cloneInject },
                ],
              }),
              m(
                '.row',
                m(
                  '.col.s12',
                  inject.type === InjectType.INJECT
                    ? m(Select, {
                        disabled,
                        iconName: getMessageIcon(inject.messageType),
                        placeholder: 'Select the message type',
                        checkedId: inject.messageType,
                        options,
                        onchange: v => {
                          // console.warn('Getting message form');
                          state.inject!.messageType = v[0] as MessageType;
                        },
                      })
                    : m('h4', [
                        m(Icon, {
                          iconName: getInjectIcon(inject.type),
                          style: 'margin-right: 12px;',
                        }),
                        inject.type,
                      ])
                )
              ),
              [
                m(MessageForm, { disabled, inject, onChange, key: 'message_form_' + inject.id }),
                inject.messageType || isInjectGroup(inject)
                  ? m(InjectConditions, {
                      injects: TrialSvc.getInjects() || [],
                      disabled,
                      inject,
                      previousInjects,
                      onChange,
                      key: 'inject_cond_' + inject.id,
                    })
                  : m('div', { key: 'dummy' }),
                m(SetObjectives, { disabled, inject, key: 'set_obj_' + inject.id }),
              ],
            ])
          : undefined
      );
    },
  };
};

/** Allows to set the main and secondary objective */
export const SetObjectives: FactoryComponent<{ inject: IInject; disabled?: boolean }> = () => {
  return {
    view: ({ attrs: { inject, disabled = false } }) => {
      const isGroup = inject && inject.type !== InjectType.INJECT;
      const objectives = [{ id: '', title: 'Pick one' }, ...(TrialSvc.getObjectives() || [])].map(o => ({
        id: o.id,
        label: o.title,
      }));
      const injectGroup = inject as IInjectGroup;
      const hasObjectives = () =>
        objectives.length > 1 &&
        (injectGroup.mainObjectiveId || injectGroup.secondaryObjectiveId) &&
        objectives.filter(o => o.id === injectGroup.mainObjectiveId || o.id === injectGroup.secondaryObjectiveId)
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
