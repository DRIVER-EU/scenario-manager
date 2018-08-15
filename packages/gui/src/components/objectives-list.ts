import m, { Vnode, Component } from 'mithril';
import { ObjectiveSvc } from '../services/objective-service';
import { IObjectiveVM, IObjective } from '../models/objective';
import { unflatten, titleAndDescriptionFilter } from '../utils/utils';
import { TreeContainer, ITreeOptions, ITreeItem, ITreeItemViewComponent } from 'mithril-tree-component';
import { ScenarioSvc } from '../services/scenario-service';
import { ISubscriptionDefinition } from '../services/message-bus-service';
import { TopicNames, objectiveChannel } from '../models/channels';
import { inputText } from '../utils/html';

export const ObjectivesList = () => {
  const state = {
    selected: undefined as IObjectiveVM | undefined,
    filterValue: '',
    scenarioId: '',
    subscription: {} as ISubscriptionDefinition<any>,
  };

  const options = {
    id: 'id',
    parentId: 'parentId',
    name: 'title',
    treeItemView: {
      view: (vnode: Vnode<ITreeItemViewComponent>) => {
        return vnode.attrs.treeItem.title;
      },
    } as Component<ITreeItemViewComponent>,
    onSelect: (ti, isSelected) => objectiveSelected(ti as IObjectiveVM, isSelected),
    onBeforeCreate: ti => {
      console.log(`On before create ${ti.title}`);
      ObjectiveSvc.create(ti as IObjective)
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
      await ObjectiveSvc.delete(ti.id);
    },
    onBeforeUpdate: (ti, action, newParent) =>
      console.log(`On before ${action} update ${ti.title} to ${newParent ? newParent.title : ''}.`),
    onUpdate: ti => {
      console.log(`On update ${ti.title}`);
      if (!ti.parentId) {
        ti.parentId = '';
      }
      ObjectiveSvc.update(ti as IObjective);
    },
    create: (parent?: IObjectiveVM) => {
      const item = {
        parentId: parent ? parent.id : undefined,
        title: 'New objective',
        scenarioId: ScenarioSvc.getCurrent().id,
      } as IObjectiveVM;
      return item as ITreeItem;
    },
    maxDepth: 1,
    editable: { canCreate: true, canDelete: true, canUpdate: true, canDeleteParent: false },
  } as ITreeOptions;

  const objectiveSelected = (selected: IObjectiveVM, isSelected: boolean) => {
    state.selected = selected;
    objectiveChannel.publish(TopicNames.ITEM_SELECT, isSelected ? { cur: selected } : { cur: {} as IObjective });
  };

  return {
    oninit: () => {
      console.log('Oninit objectives-view called...');
      const loadObjectives = async () => {
        const scenario = ScenarioSvc.getCurrent();
        state.scenarioId = scenario.id;
        if (scenario && scenario.id) {
          await ObjectiveSvc.loadListInScenario(scenario.id);
        }
      };
      state.subscription = objectiveChannel.subscribe(TopicNames.LIST, m.redraw);
      loadObjectives();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const query = titleAndDescriptionFilter(state.filterValue);
      const objectives = ObjectiveSvc.getList();
      const filteredObjectives = objectives.filter(query);
      // console.log(objectives.map(o => o.title).join('\n'));
      const tree = unflatten(filteredObjectives);
      // console.log('Objectives-list updated...');
      return m('.row', [
        inputText({
          label: 'Filter',
          id: 'filter',
          iconName: 'filter_list',
          initialValue: state.filterValue,
          onchange: (v: string) => (state.filterValue = v),
          style: 'margin-right:100px',
          classNames: 'right',
        }),
        m(TreeContainer, { tree, options }),
      ]);
    },
  };
};
