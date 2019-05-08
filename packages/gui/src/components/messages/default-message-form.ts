import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { IInject } from 'trial-manager-models';

/**
 * Default message form with a title and description.
 */
export const DefaultMessageForm: FactoryComponent<{ inject: IInject; disabled?: boolean; }> = () => ({
  view: ({ attrs: { inject, disabled } }) => [
    m(TextInput, {
      disabled,
      id: 'title',
      initialValue: inject.title,
      onchange: (v: string) => (inject.title = v),
      label: 'Title',
      iconName: 'title',
    }),
    m(TextArea, {
      disabled,
      id: 'desc',
      initialValue: inject.description,
      onchange: (v: string) => (inject.description = v),
      label: 'Description',
      iconName: 'note',
    }),
  ],
});
