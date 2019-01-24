import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select } from 'mithril-materialized';
import { IInject, InjectType, UserRole } from '../../models';
import { getMessage, iterEnum } from './../../utils';
import { TrialSvc } from '../../services';

export enum RolePlayerMessageType {
  CALL = 1,
  ACTION,
}

export interface IRolePlayerMessage {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Type of role player action */
  type: RolePlayerMessageType;
  /** Same as the inject title */
  title: string;
  /** Same as the inject description */
  description?: string;
  /** Message body */
  body?: string;
  /** The role player's ID assigned to perform the role */
  rolePlayerId?: string;
  /** The partipants' IDs assigned to the message */
  participantIds?: string[];
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
      const participants = (TrialSvc.getUsers() || [])
        .filter(u => u.role === UserRole.PARTICIPANT)
        .map(rp => ({ id: rp.id, label: rp.name }));
      const types = iterEnum(RolePlayerMessageType).map(t => ({ id: t, label: RolePlayerMessageType[t] }));
      const isAction = rpm.type === RolePlayerMessageType.ACTION;

      return [
        m(Select, {
          iconName: 'person',
          contentClass: 'col s12 m6 l3',
          placeholder: 'Select your role player',
          options: rolePlayers,
          checkedId: rpm.rolePlayerId,
          onchange: (v: unknown) => (rpm.rolePlayerId = v as string),
        }),
        m(Select, {
          iconName: 'message',
          contentClass: 'col s12 m6 l3',
          placeholder: 'Select action type',
          options: types,
          checkedId: rpm.type,
          onchange: (v: unknown) => (rpm.type = +(v as RolePlayerMessageType)),
        }),
        isAction
          ? undefined
          : m(Select, {
              iconName: 'person',
              contentClass: 'col s12 m6 l3',
              placeholder: 'Select participant(s)',
              multiple: true,
              options: participants,
              checkedId: rpm.participantIds,
              onchange: (v: unknown) => (rpm.participantIds = v as string[]),
            }),
        m(TextInput, {
          id: 'title',
          initialValue: rpm.title,
          onchange: (v: string) => (inject.title = rpm.title = v),
          label: isAction ? 'Title' : 'Subject',
          iconName: 'title',
          contentClass: 'col s12',
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
