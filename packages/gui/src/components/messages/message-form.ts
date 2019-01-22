import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { IInject, InjectType } from '../../models';
import { RolePlayerMessageForm, PhaseMessageForm } from '.';
import { GeoJsonMessageForm } from './geojson-message';

export const MessageForm: FactoryComponent<{ inject: IInject }> = () => {
  return {
    view: ({ attrs: { inject } }) => {
      switch (inject.type) {
        case InjectType.ROLE_PLAYER_MESSAGE:
          return m(RolePlayerMessageForm, { inject });
        case InjectType.PHASE_MESSAGE:
          return m(PhaseMessageForm, { inject });
        case InjectType.GEOJSON_MESSAGE:
          return m(GeoJsonMessageForm, { inject });
        default:
          return m(DefaultMessageForm, { inject });
      }
    },
  };
};

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
