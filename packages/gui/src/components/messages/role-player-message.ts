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

export const RolePlayerMessageForm: FactoryComponent<{
  inject: IInject;
  onChange?: () => void;
  disabled?: boolean;
  checkpoint?: boolean;
}> = () => {
  return {
    view: ({ attrs: { inject, disabled, checkpoint = false } }) => {
      const rpm = getMessage<IRolePlayerMsg>(inject, MessageType.ROLE_PLAYER_MESSAGE);
      const rolePlayers = TrialSvc.getUsersByRole(UserRole.ROLE_PLAYER).map(rp => ({ id: rp.id, label: rp.name }));
      const participants = TrialSvc.getUsersByRole(UserRole.PARTICIPANT).map(rp => ({ id: rp.id, label: rp.name }));
      const types = Object.keys(RolePlayerMessageType).map(t => ({ id: t, label: t }));
      if (checkpoint) {
        rpm.type = RolePlayerMessageType.ACTION;
      }
      const isAction = rpm.type === RolePlayerMessageType.ACTION;

      return [
        m(Select, {
          disabled,
          iconName: 'record_voice_over',
          className: checkpoint ? 'col s12' : isAction ? 'col s12 m6' : 'col s12 m4',
          placeholder: 'Pick role player',
          options: rolePlayers,
          checkedId: rpm.rolePlayerId,
          onchange: v => (rpm.rolePlayerId = v[0] as string),
        }),
        checkpoint
          ? undefined
          : m(Select, {
              disabled,
              iconName: getRolePlayerMessageIcon(rpm.type),
              className: isAction ? 'col s12 m6' : 'col s12 m4',
              placeholder: 'Select type',
              options: types,
              checkedId: rpm.type,
              onchange: v => (rpm.type = v[0] as RolePlayerMessageType),
            }),
        isAction
          ? undefined
          : m(Select, {
              disabled,
              iconName: 'person',
              className: 'col s12 m4',
              placeholder: 'Pick one or more',
              multiple: true,
              options: participants,
              checkedId: rpm.participantIds,
              onchange: v => (rpm.participantIds = v as string[]),
            }),
        m(TextInput, {
          disabled,
          id: 'headline',
          initialValue: rpm.headline || rpm.title,
          onchange: (v: string) => (inject.title = rpm.headline = v),
          label: checkpoint ? 'Check' : isAction ? 'Headline' : 'Subject',
          iconName: checkpoint ? getRolePlayerMessageIcon(rpm.type) : 'title',
          className: 'col s12',
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: rpm.description as string,
          onchange: (v: string) => (inject.description = rpm.description = v),
          label: 'Description',
          iconName: 'description',
        }),
      ];
    },
  };
};

/** A static view on a role player message, i.e. without the possibility to change it */
export const RolePlayerMessageView: FactoryComponent<{ inject: IExecutingInject; disabled?: boolean }> = () => {
  const msgDetails = (rpm: IRolePlayerMsg, rolePlayer: IPerson, participants?: IPerson[]) => {
    switch (rpm.type) {
      case RolePlayerMessageType.ACTION:
        return m('.action');
      case RolePlayerMessageType.MESSAGE:
      case RolePlayerMessageType.CALL:
        return m('.call', [
          m('h6', 'Call the following participants'),
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
    view: ({ attrs: { inject, disabled } }) => {
      const rpm = getMessage<IRolePlayerMsg>(inject, MessageType.ROLE_PLAYER_MESSAGE);
      const rolePlayer =
        TrialSvc.getUsers()
          .filter(u => u.id === rpm.rolePlayerId)
          .shift() || ({} as IPerson);
      const participants = TrialSvc.getUsers().filter(u =>
        rpm.participantIds && rpm.participantIds.indexOf(u.id) >= 0 ? true : false
      );
      return [
        m(
          '.row',
          m(
            '.col.s12',
            m('h5', [
              m(Icon, { iconName: getRolePlayerMessageIcon(rpm.type) }),
              ` ${rpm.headline} [${rolePlayer.name}]`,
            ])
          )
        ),
        m(
          '.row',
          m('.col.s12', [
            rpm.description ? m('p', rpm.description) : undefined,
            msgDetails(rpm, rolePlayer, participants),
          ])
        ),
      ];
    },
  };
};
