import m, { Vnode, Component } from 'mithril';
import { Icon, Select, ISelectOptions, RoundIconButton } from 'mithril-materialized';
import { getIcon, isScenario, getInjectIcon, getInjects, validateInjects } from '../../utils';
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
} from '../../../../models';
import { MeiosisComponent } from '../../services';

export const InjectsList: MeiosisComponent = () => {
  let options: ITreeOptions;
  let injects: Array<IInject | IInjectGroup>;

  return {
    oninit: ({
      attrs: {
        state: {
          app: { trial },
        },
      },
    }) => {
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
      options = {
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
            return m('div.icon-label', [m(Icon, { iconName: getIcon(inject), className }), inject.title]);
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
        onBeforeDelete: (ti) => console.log(`On before delete ${ti.title}`),
        onDelete: async (ti) => {
          await deleteInject(ti.id);
        },
        onCreate: (ti) => selectInject(ti as IInject),
        onBeforeUpdate: (ti, _, newParent) => {
          const src = ti as IInject;
          const tgt = newParent as IInject;
          switch (src.type) {
            case InjectType.INJECT:
              return tgt && tgt.type === InjectType.ACT;
            case InjectType.ACT:
              return tgt && tgt.type === InjectType.STORYLINE;
            case InjectType.STORYLINE:
              return tgt && tgt.type === InjectType.SCENARIO;
            default:
              return true;
          }
        },
        onUpdate: (ti, action) => {
          if (!ti.parentId) {
            ti.parentId = '';
          }
          if (action === 'edit') {
            updateInject(ti as IInject);
          } else {
            // action === move
            if (injects) {
              const index = injects.indexOf(ti as IInject);
              moveInject(ti as IInject, injects[index - 1]);
            }
          }
        },
        create: (parent?: IInject, depth?: number) => {
          const itemFactory: () => Partial<IInject> = () => {
            if (!parent) {
              return { title: 'New scenario', type: InjectType.SCENARIO };
            }
            const parentId = parent.id as string;
            const condition = {
              delay: 0,
              delayUnitType: 'minutes',
              type: InjectConditionType.MANUALLY,
              injectId: parentId,
            } as IInjectCondition;
            const id = uniqueId();
            switch (depth) {
              case 0:
                return { id, title: 'New storyline', type: InjectType.STORYLINE, parentId, condition };
              case 1:
                return { id, title: 'New act', type: InjectType.ACT, parentId, condition };
              default:
                return { id, title: 'New inject', type: InjectType.INJECT, parentId, condition };
            }
          };
          return itemFactory() as ITreeItem;
        },
        maxDepth: 3,
        multipleRoots: false,
        editable: { canCreate: true, canDelete: false, canUpdate: true, canDeleteParent: false },
      } as ITreeOptions;
      injects = getInjects(trial) || [];
      const scenarios = injects.filter(isScenario) || [];
      const scenario = scenarios.filter((s) => s.id === scenarioId).shift();
      if (!scenario && scenarios.length > 0) {
        selectScenario(scenarios[0]);
        m.redraw();
      }
      const filteredInjects = scenario ? pruneInjects(scenario, injects) || [] : [];
      const scenarioOptions = scenarios.map((s) => ({ id: s.id, label: s.title }));
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
                  iconName: getInjectIcon(InjectType.SCENARIO),
                  onchange: (ids) => {
                    selectScenario(ids[0] as string);
                  },
                } as ISelectOptions),
              ]),
              m(
                '.col.s2',
                m(RoundIconButton, {
                  iconName: 'add',
                  class: 'green btn-small',
                  style: 'margin: 1em;',
                  onclick: async () => {
                    const newScenario = {
                      id: uniqueId(),
                      title: 'New scenario',
                      type: InjectType.SCENARIO,
                    } as IScenario;
                    await createInject(newScenario);
                  },
                })
              ),
            ]),
            filteredInjects && filteredInjects.length > 0
              ? m(
                  '.col.s12.sb.large',
                  m(TreeContainer, { tree: filteredInjects, options, selectedId: injectId || scenarioId })
                )
              : undefined,
          ])
        : undefined;
    },
  };
};
