import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { IInject, InjectType } from '../../models';
import { getMessage } from './../../utils/utils';

export interface IRolePlayerMessage {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Same as the inject title */
  title: string;
  /** Same as the inject description */
  description?: string;
  /** Message body */
  body?: string;
  /** Attachment or images */
  urls?: Array<{ href: string; name: string; size: number }>;
}

export const RolePlayerMessageForm: FactoryComponent<{ inject: IInject }> = () => {
  return {
    view: ({ attrs: { inject } }) => {
      const rpm = getMessage(inject, InjectType.ROLE_PLAYER_MESSAGE) as IRolePlayerMessage;
      return [
        m(TextInput, {
          id: 'title',
          initialValue: rpm.title,
          onchange: (v: string) => (inject.title = rpm.title = v),
          label: 'Title',
          iconName: 'title',
        }),
        m(TextArea, {
          id: 'desc',
          initialValue: rpm.description,
          onchange: (v: string) => (inject.description = rpm.description = v),
          label: 'Description',
          iconName: 'description',
        }),
        m(TextArea, {
          id: 'body',
          initialValue: rpm.body as string,
          onchange: (v: string) => (rpm.body = v),
          label: 'Body',
          iconName: 'description',
        }),
      ];
    },
  };
};
