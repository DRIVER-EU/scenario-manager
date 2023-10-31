import m from 'mithril';
import { ResourcesForm } from './resources-form';
import { Resource, uniqueId } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { RoundIconButton, TextInput, Collection, CollectionMode, ICollectionItem } from 'mithril-materialized';
import { getActiveTrialInfo, getResources, resourceIcon } from '../../utils';

const ResourcesList: MeiosisComponent = () => {
  let filterValue = '' as string | undefined;

  return {
    view: ({
      attrs: {
        state,
        actions: { createResource, selectResource },
      },
    }) => {
      const { trial } = getActiveTrialInfo(state);
      const { resourceId } = state.app;

      const resources = getResources(trial, filterValue).sort((a, b) => (a.name > b.name || a.id > b.id ? 1 : -1)).map(r => {
        if (!r.id) r.id = uniqueId();
        return r;
      });
      if (!resourceId && resources.length > 0) {
        selectResource(resources[0]);
        // setTimeout(() => {
        //   selectUser(users[0]);
        //   m.redraw();
        // }, 0);
      }
      const items = resources.map(
        (resource) =>
          ({
            id: resource.id,
            title: resource.name || '?',
            iconName: 'create',
            avatar: resourceIcon(resource),
            className: 'yellow black-text',
            active: resourceId === resource.id,
            content: resource.desc ? `<br><i>${resource.desc}</i>` : '',
            onclick: () => selectResource(resource),
          } as ICollectionItem)
      );

      return [
        m(
          '.row',
          m('.col.s12', [
            m(RoundIconButton, {
              iconName: 'add',
              class: 'green right btn-small',
              style: 'margin: 1em;',
              onclick: async () => {
                const user = {
                  id: uniqueId(),
                  name: 'New resource',
                } as Resource;
                await createResource(user);
              },
            }),
            m(TextInput, {
              label: 'Filter',
              id: 'filter',
              iconName: 'filter_list',
              onkeyup: (_: KeyboardEvent, v?: string) => (filterValue = v),
              className: 'right',
            }),
          ])
        ),
        resources.length > 0
          ? m('.row.sb', m('.col.s12', m(Collection, { mode: CollectionMode.AVATAR, items })))
          : undefined,
      ];
    },
  };
};

export const ResourcesView: MeiosisComponent = () => {
  return {
    view: ({ attrs: { state, actions } }) =>
      m('.row', [
        m('.col.s12.m5.l4', m(ResourcesList, { state, actions })),
        m('.col.s12.m7.l8', m(ResourcesForm, { state, actions })),
      ]),
  };
};
