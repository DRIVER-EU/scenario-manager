import m, { Vnode, Component } from 'mithril';
import { Icon, Select, ISelectOptions, RoundIconButton } from 'mithril-materialized';
import {
  getIconFromTemplate,
  isScenario,
  getInjectIcon,
  getInjects,
  validateInjects,
  getUsersByRole,
} from '../../utils';
import { TreeContainer, ITreeOptions, ITreeItem, ITreeItemViewComponent } from 'mithril-tree-component';
import {
  IInject,
  InjectType,
  pruneInjects,
  uniqueId,
  IScenario,
  InjectConditionType,
  IInjectCondition,
  IInjectGroup,
  UserRole,
  IPerson,
  InjectState,
} from 'trial-manager-models';
import { MeiosisComponent } from '../../services';

export const InjectsList: MeiosisComponent = () => {
  let options: ITreeOptions;
  let injects: Array<IInject | IInjectGroup>;
  let defaultRolePlayer: IPerson | undefined;
  let getIcon: (inject: IInject) => string;

  return {
    oninit: ({
      attrs: {
        state: {
          app: { trial, templates },
        },
      },
    }) => {
      getIcon = getIconFromTemplate(templates);
      defaultRolePlayer = getUsersByRole(trial, UserRole.EXCON).shift();
      validateInjects(trial);
    },
    view: ({
      attrs: {
        state: {
          app: { trial, scenarioId, injectId, treeState },
        },
        actions: { selectInject, createInject, selectScenario, moveInject, updateInject, deleteInject },
      },
    }) => {
      options =
        options ||
        ({
          id: 'id',
          parentId: 'parentId',
          isOpen: (id: string, action: 'get' | 'set', value?: boolean): boolean | void => {
            if (action === 'get') {
              return treeState.hasOwnProperty(id) ? treeState[id] : false;
            } else if (typeof value !== 'undefined') {
              treeState[id] = value;
            }
          },
          treeItemView: {
            view: ({ attrs }: Vnode<ITreeItemViewComponent>) => {
              const inject = attrs.treeItem as IInject;
              const isValid = inject.isValid || 'valid';
              const className = isValid === 'invalid' ? 'red-text' : isValid === 'childInvalid' ? 'orange-text' : '';
              return m('div.icon-label', [
                m(Icon, {
                  iconName: inject.selectedMessage?.iconName ? inject.selectedMessage?.iconName : getIcon(inject),
                  className,
                }),
                inject.title,
              ]);
            },
          } as Component<ITreeItemViewComponent>,
          onSelect: (ti, isSelected) => isSelected && selectInject(ti as IInject),
          onBeforeCreate: (ti) => {
            createInject(ti as IInject)
              .then(() => true)
              .catch((e) => {
                console.error(e);
                return false;
              });
          },
          // onBeforeDelete: (ti) => console.log(`On before delete ${ti.title}`),
          onDelete: async (ti) => {
            await deleteInject(ti.id);
          },
          onCreate: (ti) => selectInject(ti as IInject),
          onBeforeUpdate: (ti, _, newParent) => {
            if (!newParent) return;
            const src = ti as IInject;
            const tgt = newParent as IInject;
            if (src.id === tgt.id) return false; // No drop on oneself

            let checkTgtIsNoChildOfSrc: IInject | undefined = tgt;
            do {
              if (checkTgtIsNoChildOfSrc && checkTgtIsNoChildOfSrc.parentId === src.id) return false;
              const parentId: string | undefined = checkTgtIsNoChildOfSrc?.parentId;
              checkTgtIsNoChildOfSrc = injects.find((i) => i.id === parentId);
            } while (checkTgtIsNoChildOfSrc && checkTgtIsNoChildOfSrc.parentId);

            switch (src.type) {
              case InjectType.INJECT:
                return tgt && tgt.type === InjectType.STORYLINE;
              case InjectType.STORYLINE:
                return tgt && tgt.type === InjectType.SCENARIO;
              default:
                return true;
            }
          },
          onUpdate: (ti, action, tiTarget) => {
            if (!ti.parentId) {
              ti.parentId = '';
            }
            if (action === 'edit') {
              updateInject(ti as IInject);
            } else if (action === 'move' && injects) {
              moveInject(ti as IInject, tiTarget as IInject);
            }
          },
          create: (parent?: IInject, depth?: number) => {
            const itemFactory: () => Partial<IInject> = () => {
              if (!parent) {
                return { title: 'New scenario', type: InjectType.SCENARIO };
              }
              const parentId = parent.id as string;
              const condition = {
                delay: 1,
                delayUnitType: 'minutes',
                type: InjectConditionType.MANUALLY,
                rolePlayerId: defaultRolePlayer?.id,
                injectId: parentId,
                injectState: InjectState.IN_PROGRESS,
              } as IInjectCondition;
              const id = uniqueId();
              switch (depth) {
                case 0:
                  return { id, title: 'New storyline', type: InjectType.STORYLINE, parentId, condition };
                // case 1:
                //   return { id, title: 'New act', type: InjectType.ACT, parentId, condition };
                default:
                  return { id, title: 'New inject', type: InjectType.INJECT, parentId, condition };
              }
            };
            return itemFactory() as ITreeItem;
          },
          maxDepth: 2,
          multipleRoots: false,
          editable: { canCreate: true, canDelete: false, canUpdate: true, canDeleteParent: false },
        } as ITreeOptions);
      injects = getInjects(trial) || [];
      const scenarios = injects.filter(isScenario) || [];
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario && scenarios.length > 0) {
        selectScenario(scenarios[0]);
        m.redraw();
      }
      const filteredInjects = scenario ? pruneInjects(scenario, injects) || [] : [];
      const scenarioOptions = scenarios.map((s) => ({ id: s.id, label: s.title }));
      if (!injectId && injects.length > 0) {
        selectInject(injects[0]);
      }
      if (!injectId && injects.length > 0) {
        selectInject(injects[0]);
      }

      return injects
        ? m('.row.injects-list', [
            m('.row', [
              m('.col.s10', [
                m(Select, {
                  // key: scenario ? scenarioId + scenario.title : 'scenario',
                  options: scenarioOptions,
                  checkedId: scenarioId,
                  disabled: scenarioOptions.length <= 1,
                  iconName: getInjectIcon(InjectType.SCENARIO),
                  onchange: (ids) => {
                    selectScenario(ids[0] as string);
                  },
                } as ISelectOptions<string>),
              ]),
              m(
                '.col.s2',
                m(RoundIconButton, {
                  iconName: 'add',
                  class: 'green btn-small',
                  style: 'margin: 1rem 1rem 0 0;',
                  onclick: async () => {
                    const id = uniqueId();
                    const newScenario = {
                      id,
                      title: 'New scenario',
                      type: InjectType.SCENARIO,
                      parentId: undefined,
                    } as IScenario;
                    const newStoryline = {
                      id: uniqueId(),
                      title: 'Main storyline',
                      type: InjectType.STORYLINE,
                      parentId: id,
                    };
                    await createInject(newScenario);
                    await createInject(newStoryline);
                  },
                })
              ),
            ]),

            filteredInjects && filteredInjects.length > 0
              ? m(
                  '.col.s12.sb.large',
                  { style: 'margin-top: -1rem' },
                  m(TreeContainer, { tree: filteredInjects, options, selectedId: injectId || scenarioId })
                )
              : undefined,
          ])
        : undefined;
    },
  };
};
