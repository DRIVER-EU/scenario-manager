import m from 'mithril';
import { TextInput, TextArea, Button, Icon, Select, ModalPanel, ISelectOptions } from 'mithril-materialized';
import { Resource, ResourceType, deepCopy, deepEqual } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { getActiveTrialInfo, getResources, iterEnum, resourceIcon } from '../../utils';

export const ResourcesForm: MeiosisComponent = () => {
  let resource = {} as Resource;

  const options = iterEnum(ResourceType).map((r) => ({
    id: +r,
    label: ResourceType[+r],
  }));

  return {
    view: ({
      attrs: {
        state,
        actions: { selectResource, updateResource, deleteResource },
      },
    }) => {
      const { trial } = getActiveTrialInfo(state);

      const resources = getResources(trial);
      const { resourceId } = state.app;
      if (!resourceId) {
        return m(
          'p',
          m('i', `Please, create a resource using the + button${resources.length > 0 ? ', or select one in the list' : ''}.`)
        );
      }
      const original = resources.filter((s) => s.id === resourceId).shift() || ({} as Resource);
      if (!resource || original.id !== resource.id) {
        resource = deepCopy(original);
      }

      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        if (resource) {
          updateResource(resource);
        }
      };
      const hasChanged = !deepEqual(resource, original);

      return m(
        '.row',
        { style: 'color: black' },
        m('form.col.s12', [
          m(
            '.resource-form',
            { key: resource ? resource.id : undefined },
            resource
              ? [
                m('h4', [
                  m(Icon, {
                    iconName: resourceIcon(),
                    style: 'margin-right: 12px;',
                  }),
                  'Resource details',
                ]),
                [
                  m(TextInput, {
                    id: 'name',
                    isMandatory: true,
                    initialValue: resource.name,
                    onchange: (v: string) => (resource.name = v),
                    label: 'Name',
                    iconName: 'edit',
                  }),
                  m(Select, {
                    iconName: resourceIcon(resource),
                    label: 'Type',
                    placeholder: 'Select the resource type',
                    checkedId: resource.type,
                    isMandatory: true,
                    options,
                    onchange: (v) => resource.type = +v[0] as ResourceType,
                  } as ISelectOptions<number>),
                  m(TextArea, {
                    id: 'desc',
                    initialValue: resource.desc,
                    onchange: (v: string) => (resource.desc = v),
                    label: 'Description',
                    iconName: 'description',
                  }),
                ],
                m('row', [
                  m(Button, {
                    iconName: 'undo',
                    class: `green ${hasChanged ? '' : 'disabled'}`,
                    onclick: () => (resource = deepCopy(original)),
                  }),
                  ' ',
                  m(Button, {
                    iconName: 'save',
                    class: `green ${hasChanged ? '' : 'disabled'}`,
                    onclick: onsubmit,
                  }),
                  ' ',
                  m(Button, {
                    modalId: 'delete',
                    iconName: 'delete',
                    class: 'red',
                  }),
                ]),
                m(ModalPanel, {
                  id: 'delete',
                  title: `Do you really want to delete "${resource.name}?"`,
                  options: { opacity: 0.7 },
                  buttons: [
                    {
                      label: 'OK',
                      onclick: async () => {
                        await deleteResource(resource);
                        const resources = getResources(trial);
                        const cur = resources && resources.length > 0 ? resources[0] : undefined;
                        cur && selectResource(cur);
                      },
                    },
                    {
                      label: 'Cancel',
                    },
                  ],
                }),
              ]
              : []
          ),
        ])
      );
    },
  };
};
