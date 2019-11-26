import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { IInject } from 'trial-manager-models';

/**
 * Default message form with a title and description.
 */
export const DefaultMessageForm: FactoryComponent<{
  inject: IInject;
  disabled?: boolean;
  onChange?: (inject: IInject) => void;
}> = () => ({
  view: ({ attrs: { inject, disabled, onChange } }) => [
    m(TextInput, {
      disabled,
      id: 'title',
      initialValue: inject.title,
      onchange: (v: string) => {
        inject.title = v;
        if (onChange) {
          onChange(inject);
        }
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
        if (onChange) {
          onChange(inject);
        }
      },
      label: 'Description',
      iconName: 'note',
    }),
  ],
});
