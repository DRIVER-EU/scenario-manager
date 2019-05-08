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
  InjectState,
} from 'trial-manager-models';
import { TrialSvc, RunSvc } from '../../services';
import { IExecutingInject } from '../../models';
import { createEmailLink, createPhoneLink, getMessageIcon, getRolePlayerMessageIcon } from '../../utils';

export const RolePlayerMessageForm: FactoryComponent<{
  inject: IInject;
  onChange?: () => void;
  disabled?: boolean;
}> = () => {
  return {
    view: ({ attrs: { inject, disabled } }) => {
      const rpm = getMessage<IRolePlayerMsg>(inject, MessageType.ROLE_PLAYER_MESSAGE);
      const rolePlayers = TrialSvc.getUsersByRole(UserRole.ROLE_PLAYER).map(rp => ({ id: rp.id, label: rp.name }));
      const participants = TrialSvc.getUsersByRole(UserRole.PARTICIPANT).map(rp => ({ id: rp.id, label: rp.name }));
      const types = Object.keys(RolePlayerMessageType).map(t => ({ id: t, label: t }));
      const isAction = rpm.type === RolePlayerMessageType.ACTION;

      return [
        m(Select, {
          disabled,
          iconName: 'record_voice_over',
          className: 'col s12 m4',
          placeholder: 'Pick role player',
          options: rolePlayers,
          checkedId: rpm.rolePlayerId,
          onchange: (v: unknown) => (rpm.rolePlayerId = v as string),
        }),
        m(Select, {
          disabled,
          iconName: getRolePlayerMessageIcon(rpm.type),
          className: 'col s12 m4',
          placeholder: 'Select action type',
          options: types,
          checkedId: rpm.type,
          onchange: (v: unknown) => (rpm.type = v as RolePlayerMessageType),
        }),
        isAction
          ? undefined
          : m(Select, {
              disabled,
              iconName: 'person',
              className: 'col s12 m4',
              placeholder: 'Participant',
              multiple: true,
              options: participants,
              checkedId: rpm.participantIds,
              onchange: (v: unknown) => (rpm.participantIds = v as string[]),
            }),
        m(TextInput, {
          disabled,
          id: 'title',
          initialValue: rpm.title,
          onchange: (v: string) => (inject.title = rpm.title = v),
          label: isAction ? 'Title' : 'Subject',
          iconName: 'title',
          className: 'col s12',
        }),
        m(TextArea, {
          disabled,
          id: 'headline',
          initialValue: rpm.headline,
          onchange: (v: string) => (inject.description = rpm.headline = v),
          label: 'Headline',
          iconName: 'note',
        }),
        m(TextArea, {
          disabled,
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
export const RolePlayerMessageView: FactoryComponent<{ inject: IExecutingInject; disabled?: boolean }> = () => {
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
    view: ({ attrs: { inject, disabled } }) => {
      const rpm = getMessage<IRolePlayerMsg>(inject, MessageType.ROLE_PLAYER_MESSAGE);
      const rolePlayer =
        TrialSvc.getUsers()
          .filter(u => u.id === rpm.rolePlayerId)
          .shift() || ({} as IPerson);
      const participants = TrialSvc.getUsers().filter(u =>
        rpm.participantIds && rpm.participantIds.indexOf(u.id) >= 0 ? true : false
      );
      return m(
        '.row',
        m('.col.s12', [
          m('h5', [
            m(Icon, { iconName: getRolePlayerMessageIcon(rpm.type) }),
            `${rpm.title} [${rolePlayer.name}]`,
          ]),
          rpm.headline ? [m('h6', 'Headline'), m('p', m('i', rpm.headline))] : undefined,
          rpm.description ? [m('h6', 'Description'), m('p', rpm.description)] : undefined,
          msgDetails(rpm, rolePlayer, participants),
          // // TODO Where do we store the comments, and can we retrieve them afterwards.
          // disabled
          //   ? undefined
          //   : [
          //       // m('h6', 'Comments'),
          //       // // m(TextArea, {
          //       // //   id: 'comments',
          //       // //   // initialValue: ,
          //       // //   // onchange: (v: string) => (inject.description = rpm.headline = v),
          //       // //   label: 'Comments',
          //       // //   iconName: 'note',
          //       // // }),
          //       m(FlatButton, {
          //         iconClass: 'check_circle',
          //         label: 'Done',
          //         onclick: () => {
          //           RunSvc.transition({ id: inject.id, from: inject.state, to: InjectState.EXECUTED });
          //         },
          //       }),
          //     ],
        ])
      );
    },
  };
};
