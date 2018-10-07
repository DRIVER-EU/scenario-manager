import { InjectLevel } from './../../../../server/src/models/inject-level';
import { Inject } from './../../../../server/src/inject/inject.entity';
import m, { Vnode, Component } from 'mithril';
import { unflatten, titleAndDescriptionFilter, getInjectIcon } from '../../utils/utils';
import { TreeContainer, ITreeOptions, ITreeItem, ITreeItemViewComponent } from 'mithril-tree-component';
import { ScenarioSvc } from '../../services/scenario-service';
import { ISubscriptionDefinition } from '../../services/message-bus-service';
import { TopicNames, injectChannel } from '../../models/channels';
import { inputText, smallIcon } from '../../utils/html';
import { InjectSvc } from '../../services/inject-service';

export const InjectsList = () => {
  const state = {
    selected: undefined as Inject | undefined,
    filterValue: '',
    scenarioId: '',
    subscription: {} as ISubscriptionDefinition<any>,
  };

  const options = {
    id: 'id',
    parentId: 'parentId',
    name: 'title',
    treeItemView: {
      view: ({ attrs }: Vnode<ITreeItemViewComponent>) => {
        return m('div.icon-label', [
          smallIcon(getInjectIcon(attrs.treeItem.level)),
          attrs.treeItem.title,
        ]);
      },
    } as Component<ITreeItemViewComponent>,
    onSelect: (ti, isSelected) => injectSelected(ti as Inject, isSelected),
    onBeforeCreate: ti => {
      console.log(`On before create ${ti.title}`);
      InjectSvc.create(ti as Inject)
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
      await InjectSvc.delete(ti.id);
    },
    onBeforeUpdate: (ti, action, newParent) =>
      console.log(`On before ${action} update ${ti.title} to ${newParent ? newParent.title : ''}.`),
    onUpdate: ti => {
      console.log(`On update ${ti.title}`);
      if (!ti.parentId) {
        ti.parentId = '';
      }
      InjectSvc.update(ti as Inject);
    },
    create: (parent?: Inject, depth?: number) => {
      const itemFactory: () => Partial<Inject> = () => {
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

  const injectSelected = (selected: Inject, isSelected: boolean) => {
    state.selected = selected;
    injectChannel.publish(TopicNames.ITEM_SELECT, isSelected ? { cur: selected } : { cur: {} as Inject });
  };

  return {
    oninit: () => {
      console.log('Oninit objectives-view called...');
      const loadStorylines = async () => {
        const scenario = ScenarioSvc.getCurrent();
        state.scenarioId = scenario.id;
        if (scenario && scenario.id) {
          await InjectSvc.loadListInScenario(scenario.id);
        }
      };
      state.subscription = injectChannel.subscribe(TopicNames.LIST, m.redraw);
      loadStorylines();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const query = titleAndDescriptionFilter(state.filterValue);
      const objectives = InjectSvc.getList();
      const filteredStorylines = objectives.filter(query);
      // console.log(objectives.map(o => o.title).join('\n'));
      const tree = unflatten(filteredStorylines);
      // console.log('Storylines-list updated...');
      return m('.injects-list', [
        inputText({
          label: 'Filter',
          id: 'filter',
          iconName: 'filter_list',
          initialValue: state.filterValue,
          onchange: (v: string) => (state.filterValue = v),
          classNames: 'right',
        }),
        m(TreeContainer, { tree, options }),
      ]);
    },
  };
};
