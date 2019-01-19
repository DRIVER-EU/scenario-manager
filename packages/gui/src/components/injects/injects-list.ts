import m, { Vnode, Component } from 'mithril';
import { Icon, TextInput } from 'mithril-materialized';
import { unflatten, titleAndDescriptionFilter, getInjectIcon } from '../../utils/utils';
import { TreeContainer, ITreeOptions, ITreeItem, ITreeItemViewComponent } from 'mithril-tree-component';
import { ScenarioSvc } from '../../services/scenario-service';
import { ISubscriptionDefinition } from '../../services/message-bus-service';
import { TopicNames, injectsChannel } from '../../models/channels';
import { IInject } from '../../models/inject';
import { InjectLevel } from '../../models/inject-level';

export const InjectsList = () => {
  const state = {
    selected: undefined as IInject | undefined,
    filterValue: '' as string | undefined,
    scenarioId: '' as string | undefined,
    subscription: {} as ISubscriptionDefinition<any>,
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
      ScenarioSvc.createInject(ti as IInject)
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
      await ScenarioSvc.deleteInject(ti.id);
    },
    onBeforeUpdate: (ti, action, newParent) =>
      console.log(`On before ${action} update ${ti.title} to ${newParent ? newParent.title : ''}.`),
    onUpdate: ti => {
      console.log(`On update ${ti.title}`);
      if (!ti.parentId) {
        ti.parentId = '';
      }
      ScenarioSvc.updateInject(ti as IInject);
    },
    create: (parent?: IInject, depth?: number) => {
      const itemFactory: () => Partial<IInject> = () => {
        if (!parent) {
          return { title: 'New storyline', level: InjectLevel.STORYLINE };
        }
        switch (depth) {
          case 0:
            return { title: 'New act', level: InjectLevel.ACT, parentId: parent.id };
          default:
            return { title: 'New inject', level: InjectLevel.INJECT, parentId: parent.id };
        }
      };
      return {
        ...itemFactory(),
        scenarioId: ScenarioSvc.getCurrent().id,
      } as ITreeItem;
    },
    maxDepth: 2,
    editable: { canCreate: true, canDelete: true, canUpdate: true, canDeleteParent: false },
  } as ITreeOptions;

  const injectSelected = (selected: IInject, isSelected: boolean) => {
    state.selected = selected;
    injectsChannel.publish(TopicNames.ITEM_SELECT, isSelected ? { cur: selected } : { cur: {} as IInject });
  };

  return {
    oninit: () => {
      console.log('Oninit objectives-view called...');
      const loadStorylines = async () => {
        const scenario = ScenarioSvc.getCurrent();
        state.scenarioId = scenario.id;
      };
      state.subscription = injectsChannel.subscribe(TopicNames.LIST, m.redraw);
      loadStorylines();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const query = titleAndDescriptionFilter(state.filterValue);
      const injects = ScenarioSvc.getInjects();
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
