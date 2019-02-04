import m, { Vnode, Component } from 'mithril';
import { Icon, TextInput } from 'mithril-materialized';
import { unflatten, titleAndDescriptionFilter, getInjectIcon } from '../../utils';
import { TreeContainer, ITreeOptions, ITreeItem, ITreeItemViewComponent } from 'mithril-tree-component';
import { TrialSvc } from '../../services';
import { IInject, InjectLevel } from 'trial-manager-models';
import { TopicNames, injectsChannel } from '../../models';

export const InjectsList = () => {
  const state = {
    selected: undefined as IInject | undefined,
    filterValue: '' as string | undefined,
    trialId: '' as string | undefined,
    subscription: injectsChannel.subscribe(TopicNames.LIST, m.redraw),
  };

  const options = {
    id: 'id',
    parentId: 'parentId',
    name: 'title',
    treeItemView: {
      view: ({ attrs }: Vnode<ITreeItemViewComponent>) => {
        return m('div.icon-label', [m(Icon, { iconName: getInjectIcon(attrs.treeItem.level) }), attrs.treeItem.title]);
      },
    } as Component<ITreeItemViewComponent>,
    onSelect: (ti, isSelected) => injectSelected(ti as IInject, isSelected),
    onBeforeCreate: ti => {
      console.log(`On before create ${ti.title}`);
      TrialSvc.createInject(ti as IInject)
        .then(() => true)
        .catch(e => {
          console.error(e);
          return false;
        });
    },
    onCreate: ti => {
      console.log(`On create ${ti.title}`);
    },
    onBeforeDelete: ti => console.log(`On before delete ${ti.title}`),
    onDelete: async ti => {
      console.log(`On delete ${ti.title}`);
      await TrialSvc.deleteInject(ti.id);
    },
    onBeforeUpdate: (ti, action, newParent) =>
      console.log(`On before ${action} update ${ti.title} to ${newParent ? newParent.title : ''}.`),
    onUpdate: ti => {
      console.log(`On update ${ti.title}`);
      if (!ti.parentId) {
        ti.parentId = '';
      }
      TrialSvc.updateInject(ti as IInject);
    },
    create: (parent?: IInject, depth?: number) => {
      const itemFactory: () => Partial<IInject> = () => {
        if (!parent) {
          return { title: 'New scenario', level: InjectLevel.SCENARIO };
        }
        switch (depth) {
          case 0:
            return { title: 'New storyline', level: InjectLevel.STORYLINE, parentId: parent.id };
          case 1:
            return { title: 'New act', level: InjectLevel.ACT, parentId: parent.id };
          default:
            return { title: 'New inject', level: InjectLevel.INJECT, parentId: parent.id };
        }
      };
      return {
        ...itemFactory(),
        // TODO remove?
        scenarioId: TrialSvc.getCurrent().id,
      } as ITreeItem;
    },
    maxDepth: 3,
    editable: { canCreate: true, canDelete: true, canUpdate: true, canDeleteParent: false },
  } as ITreeOptions;

  const injectSelected = (selected: IInject, isSelected: boolean) => {
    state.selected = selected;
    injectsChannel.publish(TopicNames.ITEM_SELECT, isSelected ? { cur: selected } : { cur: {} as IInject });
  };

  return {
    oninit: () => {
      console.log('Oninit objectives-view called...');
      const loadScenarios = async () => {
        const trial = TrialSvc.getCurrent();
        state.trialId = trial.id;
      };
      loadScenarios();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const query = titleAndDescriptionFilter(state.filterValue);
      const injects = TrialSvc.getInjects();
      const filteredInjects = injects && injects.filter(query);
      // console.log(objectives.map(o => o.title).join('\n'));
      const tree = unflatten(filteredInjects);
      // console.log('Storylines-list updated...');
      return m('.row.injects-list', [
        m(
          '.col.s12',
          m(TextInput, {
            label: 'Filter',
            id: 'filter',
            iconName: 'filter_list',
            initialValue: state.filterValue,
            onkeyup: (ev: KeyboardEvent, v?: string) => (state.filterValue = v),
            contentClass: 'right',
          })
        ),
        m('.col.s12', m(TreeContainer, { tree, options })),
      ]);
    },
  };
};
