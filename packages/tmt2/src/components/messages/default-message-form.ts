import m from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { MeiosisComponent } from '../../services';
import { getInject } from '../../utils';

/**
 * Default message form with a title and description.
 */
export const DefaultMessageForm: MeiosisComponent = () => ({
  view: ({
    attrs: {
      state: {
        app: { mode, trial, injectId },
      },
      actions: { updateInject },
    },
  }) => {
    const inject = getInject(trial, injectId);
    const disabled = mode !== 'edit';
    return (
      inject && [
        m(TextInput, {
          disabled,
          id: 'title',
          initialValue: inject.title,
          onchange: (v: string) => {
            inject.title = v;
            updateInject(inject);
            // if (onChange) {
            //   onChange(inject, 'title');
            // }
          },
          label: 'Title',
          iconName: 'title',
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => {
            inject.description = v;
            updateInject(inject);
            // if (onChange) {
            //   onChange(inject, 'description');
            // }
          },
          label: 'Description',
          iconName: 'note',
        }),
      ]
    );
  },
});
