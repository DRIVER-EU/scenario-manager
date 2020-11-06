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
  canDeleteInject,
  getInjects,
  getObjectives,
} from '../../utils';
import {
  IInject,
  InjectType,
  IInjectGroup,
  deepCopy,
  deepEqual,
  MessageType,
  getAllChildren,
  uniqueId,
  IScenario,
  InjectKeys,
  ITrial,
} from '../../../../models';
import { InjectConditions } from './inject-conditions';
import { MessageForm } from '../messages';
import { MeiosisComponent } from '../../services';

export interface IInjectsForm extends Attributes {
  disabled?: boolean;
}

export const InjectsForm: MeiosisComponent = () => {
  let inject: IInject;
  let copiedInjectIsCut = false;
  let copiedInjects = undefined as undefined | IInject | IInject[];

  // const state = {
  //   parent: undefined as IInject | IInjectGroup | undefined,
  //   oldInject: undefined as IInject | undefined,
  //   inject: undefined as IInject | undefined,
  //   original: undefined as IInject | undefined,
  //   saving: undefined as boolean | undefined,
  //   version: 0,
  //   // subscription: injectsChannel.subscribe(TopicNames.ITEM, ({ cur }, envelope) => {
  //   //   if (Object.keys(cur).length === 0) {
  //   //     return;
  //   //   }
  //   //   state.version++;
  //   //   const { inject, original } = state;
  //   //   if (!state.saving && inject && cur.id !== inject.id && !deepEqual(original, inject)) {
  //   //     state.oldInject = state.inject;
  //   //     TrialSvc.updateInject(state.oldInject);
  //   //   }
  //   //   state.saving = false;
  //   //   if (envelope.topic === TopicNames.ITEM_UPDATE && inject && inject.id !== cur.id) {
  //   //     return;
  //   //   }
  //   //   state.inject = cur ? deepCopy(cur) : undefined;
  //   //   state.original = cur ? deepCopy(cur) : undefined;
  //   //   state.parent = cur.parentId ? getInject(cur.parentId, TrialSvc.getInjects()) : undefined;
  //   // }),
  // };

  const onChange = (inj: IInject, props: InjectKeys, save = false) => {
    if (!inject) {
      return;
    }
    const applyChange = (prop: InjectKeys) => {
      switch (prop) {
        case 'title':
          inject = { ...inject, title: inj.title };
          break;
        case 'description':
          inject = { ...inject, description: inj.description };
          break;
        case 'startDate':
          inject = { ...inject, startDate: (inj as IScenario).startDate } as IScenario;
          break;
        case 'endDate':
          inject = { ...inject, endDate: (inj as IScenario).endDate } as IScenario;
          break;
        case 'todoBefore':
          inject = { ...inject, todoBefore: (inj as IScenario).todoBefore } as IScenario;
          break;
        case 'todoAfter':
          inject = { ...inject, todoAfter: (inj as IScenario).todoAfter } as IScenario;
          break;
        case 'message':
          inject = { ...inject, message: inj.message };
          break;
        case 'condition':
          inject = { ...inject, condition: inj.condition };
          break;
        case 'isOpen':
          inject = { ...inject, isOpen: inj.isOpen };
          break;
      }
    };
    if (props instanceof Array) {
      props.forEach((prop) => applyChange(prop));
    } else {
      applyChange(props);
    }
    if (save) {
      // onsubmit();
      // TODO Save
    }
    // console.table(inj);
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
    oninit: () => console.log('ONINIT InjectsForm'),
    view: ({ attrs: { state, actions } }) => {
      const { trial, injectId } = state.app;
      const { updateInject, createInject, deleteInject } = actions;

      const injects = getInjects(trial);
      const original = injects.filter((i) => i.id === injectId).shift();
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
            createFreshInjects(copiedInjects, copy.parentId!, newParentId).map((i) => newInject(i));
            await updateInject(inject);
          } else if (isSiblingRelation) {
            createFreshInjects(copiedInjects.slice(1), copy.id as string, newParentId).map((i) => newInject(i));
            await updateInject(inject);
          } else if (isInject(inject) && isInject(copy)) {
            const clone = deepCopy(copy);
            // console.log(getInjects.length);
            clone.id = '';
            clone.parentId = inject.parentId;
            await createInject(clone);
            // console.log(TrialSvc.getInjects.length);
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
          copiedInjects = [inject, ...getAllChildren(getInjects() || [], inject.id as string)];
        }
      };

      const cloneInject = async (inject: IInject) => {
        if (inject) {
          await copyInject(inject);
          await pasteInject(inject);
        }
      };
      const disabled = false;
      // const key = `${inject.id}_${Date.now().valueOf()}`;
      // console.log('Key: ' + key);

      // const hasChanged = !deepEqual(inject, original);
      // if (hasChanged) {
      //   updateInject(inject);
      // }
      const previousInjects = findPreviousInjects(inject, getInjects(trial));
      const selectedMessageTypes = trial.selectedMessageTypes;
      const options = messageOptions(selectedMessageTypes);

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
              m(
                '.col.s12',
                inject.type === InjectType.INJECT
                  ? m(Select, {
                      disabled,
                      iconName: getMessageIcon(inject.messageType),
                      placeholder: 'Select the message type',
                      checkedId: inject.messageType,
                      options,
                      onchange: (v) => {
                        // console.warn('Getting message form');
                        inject!.messageType = v[0] as MessageType;
                        updateInject(inject);
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
              m(MessageForm, { state, actions }),
              inject.messageType &&
                isInjectGroup(inject) &&
                m(InjectConditions, {
                  trial,
                  injects: getInjects(trial) || [],
                  disabled,
                  inject,
                  previousInjects,
                  onChange,
                }),
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
