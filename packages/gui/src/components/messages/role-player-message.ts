import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, Collection, CollectionMode, Icon, FlatButton } from 'mithril-materialized';
import {
  getMessage,
  IInject,
  MessageType,
  UserRole,
  IRolePlayerMsg,
  RolePlayerMessageType,
  IPerson,
} from 'trial-manager-models';
import { TrialSvc } from '../../services';
import { IExecutingInject } from '../../models';
import { createEmailLink, createPhoneLink, getMessageIcon, getRolePlayerMessageIcon } from '../../utils';

export const RolePlayerMessageForm: FactoryComponent<{ inject: IInject; onChange: () => void }> = () => {
  return {
    view: ({ attrs: { inject } }) => {
      const rpm = getMessage<IRolePlayerMsg>(inject, MessageType.ROLE_PLAYER_MESSAGE);
      const rolePlayers = TrialSvc.getUsersByRole(UserRole.ROLE_PLAYER).map(rp => ({ id: rp.id, label: rp.name }));
      const participants = TrialSvc.getUsersByRole(UserRole.PARTICIPANT).map(rp => ({ id: rp.id, label: rp.name }));
      const types = Object.keys(RolePlayerMessageType).map(t => ({ id: t, label: t }));
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
          onchange: (v: unknown) => (rpm.type = v as RolePlayerMessageType),
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

/** A static view on a role player message, i.e. without the possibility to change it */
export const RolePlayerMessageView: FactoryComponent<{ inject: IExecutingInject }> = () => {
  const msgDetails = (rpm: IRolePlayerMsg, rolePlayer: IPerson, participants?: IPerson[]) => {
    switch (rpm.type) {
      case RolePlayerMessageType.ACTION:
        return m('.action');
      case RolePlayerMessageType.MESSAGE:
      case RolePlayerMessageType.CALL:
        return m('.call', [
          participants
            ? m(Collection, {
                mode: CollectionMode.BASIC,
                items: participants.map(p => ({
                  title: m('ul.list-inline', [
                    m('li', m('b', `${p.name}: `)),
                    m('li', p.mobile ? m('a', { href: createPhoneLink(p.mobile) }, p.mobile) : ''),
                    m('li', p.mobile ? '(m)' : ''),
                    m('li', p.phone ? ', ' : ''),
                    m('li', p.phone ? m('a', { href: createPhoneLink(p.phone) }, p.phone) : ''),
                    m('li', p.phone ? '(p)' : ''),
                  ]),
                })),
              })
            : undefined,
        ]);
      case RolePlayerMessageType.MAIL:
        const emails = participants ? participants.filter(p => p.email).map(p => p.email) : undefined;
        return m('.mail', [
          emails
            ? m(FlatButton, {
                iconName: 'email',
                label: 'Send email',
                href: createEmailLink(emails, rpm.headline, rpm.description),
              })
            : undefined,
          participants
            ? m(Collection, {
                mode: CollectionMode.BASIC,
                items: participants.map(p => ({
                  title: `${p.name}: ${p.email ? p.email : ''}`,
                })),
              })
            : undefined,
        ]);
      case RolePlayerMessageType.TWEET:
        return m('.tweet');
      default:
        return undefined;
    }
  };

  return {
    view: ({ attrs: { inject } }) => {
      const rpm = getMessage<IRolePlayerMsg>(inject, MessageType.ROLE_PLAYER_MESSAGE);
      const rolePlayer =
        TrialSvc.getUsers()
          .filter(u => u.id === rpm.rolePlayerId)
          .shift() || ({} as IPerson);
      const participants = TrialSvc.getUsers().filter(u =>
        rpm.participantIds && rpm.participantIds.indexOf(u.id) >= 0 ? true : false
      );
      return m('.row', [
        m('h5', [
          m(Icon, { iconName: getRolePlayerMessageIcon(rpm.type) }),
          `${rpm.title} [${rolePlayer.name}]`,
        ]),
        rpm.headline ? m('p', m('i', rpm.headline)) : undefined,
        rpm.description ? m('p', rpm.description) : undefined,
        msgDetails(rpm, rolePlayer, participants),
      ]);
    },
  };
};
