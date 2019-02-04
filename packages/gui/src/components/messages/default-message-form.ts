import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { IInject } from 'trial-manager-models';

/**
 * Default message form with a title and description.
 */
export const DefaultMessageForm: FactoryComponent<{ inject: IInject }> = () => ({
  view: ({ attrs: { inject } }) => [
    m(TextInput, {
      id: 'title',
      initialValue: inject.title,
      onchange: (v: string) => (inject.title = v),
      label: 'Title',
      iconName: 'title',
    }),
    m(TextArea, {
      id: 'desc',
      initialValue: inject.description,
      onchange: (v: string) => (inject.description = v),
      label: 'Description',
      iconName: 'note',
    }),
  ],
});
