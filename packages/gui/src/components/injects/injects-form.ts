import m, { FactoryComponent, Attributes } from 'mithril';
import { Button, Icon, Dropdown, Select, FloatingActionButton } from 'mithril-materialized';
import {
  getInjectIcon,
  findPreviousInjects,
  getMessageIcon,
  getMessageTitle,
  enumToOptions,
  isScenario,
  isStoryline,
  isAct,
  isInject,
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
  getChildren,
  getAllChildren,
  uniqueId,
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

  return {
    onremove: () => {
      state.subscription.unsubscribe();
    },
    view: ({ attrs: { className, disabled = false } }) => {
      const { inject, original } = state;
      // console.table(inject);
      const onChange = (inj?: IInject) => {
        if (inj) {
          state.inject = inj;
        }
        m.redraw();
      };
      const hasChanged = !deepEqual(inject, original);
      if (hasChanged) {
        onsubmit();
      }
      const previousInjects = findPreviousInjects(inject, TrialSvc.getInjects());
      const options = enumToOptions(MessageType).map(({ id }) => ({ id, label: getMessageTitle(id as MessageType) }));

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

      // /** Copy from Act to Storyline */
      // const copyFromActToStoryline = (injects: IInject[], fromAct: IInject, toStoryline: IInjectGroup) => {
      //   const parentId = toStoryline.id;
      //   const newParent = TrialSvc.newInject({ ...fromAct, id: '', parentId });
      //   getChildren(injects, fromAct.id)
      //     .map(deepCopy)
      //     .map(child => ({ ...child, id: '', parentId: newParent.id }))
      //     .forEach(TrialSvc.newInject);
      // };

      // const copyFromStorylineToScenario = (injects: IInject[], fromStoryline: IInject, toScenario: IInjectGroup) => {
      //   const parentId = toScenario.id;
      //   const newParent = TrialSvc.newInject({ ...fromStoryline, id: '', parentId });
      //   getChildren(injects, fromStoryline.id)
      //     .map(deepCopy)
      //     .forEach(act => copyFromActToStoryline(injects, act, newParent));
      // };

      // const pasteInject = async () => {
      //   debugger;
      //   if (inject && AppState.copiedInject) {
      //     const injects = TrialSvc.getInjects() || [];
      //     const copy = AppState.copiedInject;
      //     const isCut = AppState.copiedInjectIsCut;
      //     const parentId = inject.id;
      //     if (isScenario(inject)) {
      //       if (isStoryline(copy)) {
      //         copyFromStorylineToScenario(injects, copy, inject);
      //       } else if (isScenario(copy)) {
      //         getChildren(injects, copy.id).forEach(s => copyFromStorylineToScenario(injects, s, inject));
      //       }
      //     } else if (isStoryline(inject)) {
      //       if (isAct(copy)) {
      //         copyFromActToStoryline(injects, copy, inject);
      //       } else if (isStoryline(copy)) {
      //         getChildren(injects, copy.id).forEach(act => copyFromActToStoryline(injects, act, inject));
      //       }
      //     } else if (isAct(inject)) {
      //       if (isInject(copy)) {
      //         copy.parentId = parentId;
      //         if (!isCut) {
      //           copy.id = '';
      //         }
      //         TrialSvc.newInject(copy);
      //       } else if (isAct(copy)) {
      //         getChildren(injects, copy.id)
      //           .map(deepCopy)
      //           .map(child => ({ ...child, id: '', parentId }))
      //           .forEach(child => TrialSvc.newInject(child));
      //       }
      //     } else if (isInject(inject) && isInject(copy)) {
      //       if (isCut && copy.parentId === inject.parentId) {
      //         TrialSvc.newInject(copy);
      //         return;
      //       }
      //       if (!isCut) {
      //         copy.id = '';
      //       }
      //       copy.parentId = inject.parentId;
      //       TrialSvc.newInject(copy);
      //     }
      //     // await TrialSvc.saveTrial();
      //   }
      // };

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

      const pasteInject = async () => {
        if (inject && AppState.copiedInjects) {
          const injects = AppState.copiedInjects as IInject[];
          const copy = AppState.copiedInjects instanceof Array ? AppState.copiedInjects[0] : AppState.copiedInjects;
          const isCut = AppState.copiedInjectIsCut;
          const parentId = inject.id;
          const npi = inject.id;
          if (isScenario(inject)) {
            if (isStoryline(copy)) {
              createFreshInjects(injects, copy.parentId!, npi).map(i => TrialSvc.newInject(i));
            } else if (isScenario(copy)) {
              createFreshInjects((injects).slice(1), copy.id, npi).map(i => TrialSvc.newInject(i));
            }
          } else if (isStoryline(inject)) {
            if (isAct(copy)) {
              createFreshInjects(injects, copy.parentId!, npi).map(i => TrialSvc.newInject(i));
            } else if (isStoryline(copy)) {
              createFreshInjects((injects).slice(1), copy.id, npi).map(i => TrialSvc.newInject(i));
            }
          } else if (isAct(inject)) {
            if (isInject(copy)) {
              copy.parentId = parentId;
              if (!isCut) {
                copy.id = '';
              }
              TrialSvc.newInject(copy);
            } else if (isAct(copy)) {
              createFreshInjects((injects).slice(1), copy.id, npi).map(i => TrialSvc.newInject(i));
            }
          } else if (isInject(inject) && isInject(copy)) {
            if (isCut && copy.parentId === inject.parentId) {
              TrialSvc.newInject(copy);
              return;
            }
            if (!isCut) {
              copy.id = '';
            }
            copy.parentId = inject.parentId;
            TrialSvc.newInject(copy);
          }
          await TrialSvc.saveTrial();
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
                    onClick: () => pasteInject(),
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
                m(InjectConditions, {
                  injects: TrialSvc.getInjects() || [],
                  disabled,
                  inject,
                  previousInjects,
                  onChange,
                  key: 'inject_cond_' + inject.id,
                }),
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
