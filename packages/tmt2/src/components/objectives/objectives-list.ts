import m, { Component } from 'mithril';
import { TextInput, Collection, ICollectionItem } from 'mithril-materialized';
import { getObjectives } from '../../utils';
import { TreeContainer, ITreeOptions, ITreeItem, ITreeItemViewComponent } from 'mithril-tree-component';
import { IObjective, uniqueId } from '../../../../models';
import { MeiosisComponent } from '../../services';

export const ObjectivesList: MeiosisComponent = () => {
  let filterValue = '' as string | undefined;
  let treeState: Record<string, boolean> = {};

  const isOpen = (() => {
    const store: Record<string, boolean> = {};
    return (id: string, action: 'get' | 'set', value?: boolean): boolean | void => {
      if (action === 'get') {
        return store.hasOwnProperty(id) ? store[id] : false;
      } else if (typeof value !== 'undefined') {
        store[id] = value;
      }
    };
  })();

  return {
    view: ({
      attrs: {
        state: {
          app: { trial },
        },
        actions: { selectObjective, createObjective, deleteObjective, updateObjective },
      },
    }) => {
      const options = {
        id: 'id',
        parentId: 'parentId',
        name: 'title',
        logging: true,
        isOpen,
        treeItemView: {
          view: ({ attrs }) => {
            return attrs.treeItem.title;
          },
        } as Component<ITreeItemViewComponent>,
        onSelect: (ti, isSelected) => isSelected && selectObjective(ti as IObjective),
        onCreate: (ti) => {
          createObjective(ti as IObjective);
        },
        onDelete: async (ti) => {
          deleteObjective(ti as IObjective);
        },
        onUpdate: (ti, action) => {
          if (!ti.parentId) {
            ti.parentId = '';
          }
          // debugger;
          // if (action === 'edit') {
          updateObjective(ti as IObjective);
          // } else {
          //   TrialSvc.setObjectives(state.objectives);
          //   TrialSvc.patch();
          // }
        },
        create: (parent?: IObjective) => {
          const item = {
            id: uniqueId(),
            parentId: parent ? parent.id : undefined,
            title: 'New objective',
          } as IObjective;
          return item as ITreeItem;
        },
        maxDepth: 1,
        editable: { canCreate: true, canDelete: true, canUpdate: true, canDeleteParent: false },
      } as ITreeOptions;

      const selectedObjectives = getObjectives(trial, filterValue).map((o) => {
        if (!treeState.hasOwnProperty(o.id)) {
          treeState[o.id] = false;
        }
        const isOpen = treeState[o.id];
        return { ...o, isOpen };
      });
      return (
        selectedObjectives &&
        m('.row.objectives-list', [
          m(
            '.col.s12',
            m(TextInput, {
              label: 'Filter',
              id: 'filter',
              iconName: 'filter_list',
              initialValue: filterValue,
              onkeyup: (_: KeyboardEvent, v?: string) => (filterValue = v),
              className: 'right',
            })
          ),
          m(
            '.col.s12',
            filterValue
              ? m(Collection, {
                  items: selectedObjectives.map((cur) => ({
                    title: cur.title,
                    content: cur.description,
                    iconName: 'my_location',
                    onclick: (i: ICollectionItem) => selectObjective(cur),
                  })),
                })
              : m(TreeContainer, { tree: selectedObjectives, options })
          ),
        ])
      );
    },
  };
};
