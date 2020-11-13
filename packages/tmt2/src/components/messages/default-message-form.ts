import m from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { MessageComponent } from '../../services';
import { getActiveTrialInfo } from '../../utils';

/**
 * Default message form with a title and description.
 */
export const DefaultMessageForm: MessageComponent = () => ({
  view: ({
    attrs: {
      state,
      actions: { updateInject },
      options: { editing } = { editing: true },
    },
  }) => {
    const { inject } = getActiveTrialInfo(state);
    const disabled = !editing;
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
