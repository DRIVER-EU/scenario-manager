import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select } from 'mithril-materialized';
import { IInject, InjectType, UserRole } from '../../models';
import { getMessage } from './../../utils/utils';
import { TrialSvc } from './../../services/scenario-service';

export interface IRolePlayerMessage {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Same as the inject title */
  title: string;
  /** Same as the inject description */
  description?: string;
  /** Message body */
  body?: string;
  /** The role player's ID assigned to perform the role */
  rolePlayerId?: string;
  /** Attachment or images */
  urls?: Array<{ href: string; name: string; size: number }>;
}

export const RolePlayerMessageForm: FactoryComponent<{ inject: IInject }> = () => {
  return {
    view: ({ attrs: { inject } }) => {
      const rpm = getMessage(inject, InjectType.ROLE_PLAYER_MESSAGE) as IRolePlayerMessage;
      const rolePlayers = (TrialSvc.getUsers() || [])
        .filter(u => u.role === UserRole.ROLE_PLAYER)
        .map(rp => ({ id: rp.id, label: rp.name }));

      return [
        m(TextInput, {
          id: 'title',
          initialValue: rpm.title,
          onchange: (v: string) => (inject.title = rpm.title = v),
          label: 'Title',
          iconName: 'title',
          contentClass: 'col s12 m6',
        }),
        m(Select, {
          iconName: 'person',
          contentClass: 'col s12 m6',
          placeholder: 'Select your role player',
          options: rolePlayers,
          checkedId: rpm.rolePlayerId,
          onchange: (v: unknown) => (rpm.rolePlayerId = v as string),
        }),
        m(TextArea, {
          id: 'desc',
          initialValue: rpm.description,
          onchange: (v: string) => (inject.description = rpm.description = v),
          label: 'Description',
          iconName: 'note',
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
