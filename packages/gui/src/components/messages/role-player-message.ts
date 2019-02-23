import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select } from 'mithril-materialized';
import { IInject, MessageType, UserRole, IRolePlayerMessage, RolePlayerMessageType } from 'trial-manager-models';
import { getMessage, iterEnum, userRolesFilter } from './../../utils';
import { TrialSvc } from '../../services';

export const RolePlayerMessageForm: FactoryComponent<{ inject: IInject }> = () => {
  return {
    view: ({ attrs: { inject } }) => {
      const rpm = getMessage(inject, MessageType.ROLE_PLAYER_MESSAGE) as IRolePlayerMessage;
      const rolePlayers = (TrialSvc.getUsers() || [])
        .filter(u => userRolesFilter(u, UserRole.ROLE_PLAYER))
        .map(rp => ({ id: rp.id, label: rp.name }));
      const participants = (TrialSvc.getUsers() || [])
        .filter(u => userRolesFilter(u, UserRole.PARTICIPANT))
        .map(rp => ({ id: rp.id, label: rp.name }));
      const types = iterEnum(RolePlayerMessageType).map(t => ({ id: t, label: RolePlayerMessageType[t] }));
      const isAction = rpm.type === RolePlayerMessageType.ACTION;

      return [
        m(Select, {
          iconName: 'record_voice_over',
          className: 'col s12 m4',
          placeholder: 'Pick role player',
          options: rolePlayers,
          checkedId: rpm.rolePlayerId,
          onchange: (v: unknown) => (rpm.rolePlayerId = v as string),
        }),
        m(Select, {
          iconName: rpm.type === RolePlayerMessageType.CALL ? 'phone' : 'fiber_smart_record',
          className: 'col s12 m4',
          placeholder: 'Select action type',
          options: types,
          checkedId: rpm.type,
          onchange: (v: unknown) => (rpm.type = +(v as RolePlayerMessageType)),
        }),
        isAction
          ? undefined
          : m(Select, {
              iconName: 'person',
              className: 'col s12 m4',
              placeholder: 'Participant',
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
          className: 'col s12',
        }),
        m(TextArea, {
          id: 'headline',
          initialValue: rpm.headline,
          onchange: (v: string) => (inject.description = rpm.headline = v),
          label: 'Headline',
          iconName: 'note',
        }),
        m(TextArea, {
          id: 'desc',
          initialValue: rpm.description as string,
          onchange: (v: string) => (rpm.description = v),
          label: 'Description',
          iconName: 'description',
        }),
      ];
    },
  };
};
