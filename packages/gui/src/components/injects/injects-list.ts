import m, { Vnode, Component } from 'mithril';
import { Icon, Select, ISelectOptions, RoundIconButton } from 'mithril-materialized';
import { getIcon, isScenario, getInjectIcon } from '../../utils';
import { TreeContainer, ITreeOptions, ITreeItem, ITreeItemViewComponent } from 'mithril-tree-component';
import { TrialSvc } from '../../services';
import { IInject, InjectType, pruneInjects, uniqueId, IScenario } from 'trial-manager-models';
import { TopicNames, injectsChannel, AppState } from '../../models';

export const InjectsList = () => {
  const state = {
    selected: undefined as IInject | undefined,
    filterValue: '' as string | undefined,
    trialId: '' as string | undefined,
    injects: undefined as IInject[] | undefined,
    subscription: injectsChannel.subscribe(TopicNames.LIST, m.redraw),
  };

  const options = {
    id: 'id',
    parentId: 'parentId',
    treeItemView: {
      view: ({ attrs }: Vnode<ITreeItemViewComponent>) => {
        const inject = attrs.treeItem as IInject;
        const isValid = inject.isValid || 'valid';
        const className = isValid === 'invalid' ? 'red-text' : isValid === 'childInvalid' ? 'orange-text' : '';
        return m('div.icon-label', [m(Icon, { iconName: getIcon(inject), className }), inject.title]);
      },
    } as Component<ITreeItemViewComponent>,
    onSelect: (ti, isSelected) => injectSelected(ti as IInject, isSelected),
    onBeforeCreate: ti => {
      TrialSvc.createInject(ti as IInject)
        .then(() => true)
        .catch(e => {
          console.error(e);
          return false;
        });
    },
    onBeforeDelete: ti => console.log(`On before delete ${ti.title}`),
    onDelete: async ti => {
      await TrialSvc.deleteInject(ti.id);
    },
    onCreate: ti => injectSelected(ti as IInject, true),
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
        TrialSvc.updateInject(ti as IInject);
      } else {
        TrialSvc.setInjects(state.injects);
      }
    },
    create: (parent?: IInject, depth?: number) => {
      const itemFactory: () => Partial<IInject> = () => {
        if (!parent) {
          return { title: 'New scenario', type: InjectType.SCENARIO };
        }
        switch (depth) {
          case 0:
            return { title: 'New storyline', type: InjectType.STORYLINE, parentId: parent.id };
          case 1:
            return { title: 'New act', type: InjectType.ACT, parentId: parent.id };
          default:
            return { title: 'New inject', type: InjectType.INJECT, parentId: parent.id };
        }
      };
      return itemFactory() as ITreeItem;
    },
    maxDepth: 3,
    multipleRoots: false,
    editable: { canCreate: true, canDelete: false, canUpdate: true, canDeleteParent: false },
  } as ITreeOptions;

  const injectSelected = (selected?: IInject, isSelected?: boolean) => {
    if (!selected) {
      return;
    }
    state.selected = selected;
    injectsChannel.publish(TopicNames.ITEM_SELECT, isSelected ? { cur: selected } : { cur: {} as IInject });
  };

  return {
    oninit: () => {
      const loadScenarios = async () => {
        const trial = TrialSvc.getCurrent();
        const injects = TrialSvc.getInjects();
        state.injects = injects;
        state.trialId = trial.id;
        TrialSvc.validateInjects();
        const scenarios = trial.injects.filter(isScenario);
        const scenarioId = AppState.scenarioId || (scenarios.length > 0 ? scenarios[0].id : '');
        AppState.scenarioId = scenarioId;
      };
      loadScenarios();
    },
    onremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { scenarioId } = AppState;
      const injects = TrialSvc.getInjects() || [];
      const scenarios = injects.filter(isScenario) || [];
      const scenario = scenarios.filter(s => s.id === scenarioId).shift() || scenarios[0];
      const filteredInjects = scenario ? pruneInjects(scenario, injects) || [] : [];
      const scenarioOptions = scenarios.map(s => ({ id: s.id, label: s.title }));
      state.injects = filteredInjects;
      if (!state.selected && injects && injects.length > 0) {
        setTimeout(() => {
          injectSelected(injects.filter(i => !i.parentId).shift(), true);
          m.redraw();
        }, 0);
      }
      return injects
        ? m('.row.injects-list', [
            m('.col.s12', [
              m(RoundIconButton, {
                iconName: 'add',
                class: 'green right btn-small',
                style: 'margin: 1em;',
                onclick: async () => {
                  const newScenario = {
                    id: uniqueId(),
                    title: 'New scenario',
                    type: InjectType.SCENARIO,
                  } as IScenario;
                  AppState.scenarioId = newScenario.id;
                  await TrialSvc.createInject(newScenario);
                  injectsChannel.publish(TopicNames.ITEM_CREATE, { cur: newScenario });
                },
              }),
              m(Select, {
                options: scenarioOptions,
                checkedId: scenarioId,
                className: 'right',
                iconName: getInjectIcon(InjectType.SCENARIO),
                onchange: ids => {
                  AppState.scenarioId = ids[0] as string;
                },
              } as ISelectOptions),
            ]),
            filteredInjects && filteredInjects.length > 0
              ? m('.col.s12.sb.large', m(TreeContainer, { tree: filteredInjects, options }))
              : undefined,
          ])
        : undefined;
    },
  };
};
