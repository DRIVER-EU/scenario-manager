import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { IInject, InjectKeys } from 'trial-manager-models';

/**
 * Default message form with a title and description.
 */
export const DefaultMessageForm: FactoryComponent<{
  inject: IInject;
  disabled?: boolean;
  onChange?: (inject: IInject, prop: InjectKeys) => void;
}> = () => ({
  view: ({ attrs: { inject, disabled, onChange } }) => [
    m(TextInput, {
      disabled,
      id: 'title',
      initialValue: inject.title,
      onchange: (v: string) => {
        inject.title = v;
        if (onChange) {
          onChange(inject, 'title');
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
          onChange(inject, 'description');
        }
      },
      label: 'Description',
      iconName: 'note',
    }),
  ],
});
