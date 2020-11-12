import m from 'mithril';
import { TextArea, TextInput, Select, Collection, CollectionMode, Icon, FlatButton } from 'mithril-materialized';
import { getMessage, MessageType, UserRole, IRolePlayerMsg, RolePlayerMessageType, IPerson } from '../../../../models';
import { MeiosisComponent, RunSvc } from '../../services';
import { createEmailLink, createPhoneLink, getInject, getRolePlayerMessageIcon, getUsersByRole } from '../../utils';

export const RolePlayerMessageForm: MeiosisComponent<{ checkpoint?: boolean }> = () => {
  return {
    view: ({
      attrs: {
        options: { checkpoint = false } = {},
        state: {
          app: { trial, injectId, mode },
        },
        actions: { updateInject },
      },
    }) => {
      const inject = getInject(trial, injectId);
      if (!inject) return;
      const rpm = getMessage<IRolePlayerMsg>(inject, MessageType.ROLE_PLAYER_MESSAGE);
      const rolePlayers = getUsersByRole(trial, UserRole.ROLE_PLAYER).map((rp) => ({ id: rp.id, label: rp.name }));
      const participants = getUsersByRole(trial, UserRole.PARTICIPANT).map((rp) => ({ id: rp.id, label: rp.name }));
      const types = Object.keys(RolePlayerMessageType).map((t) => ({ id: t, label: t }));
      const disabled = mode !== 'edit';

      if (checkpoint) {
        rpm.type = RolePlayerMessageType.ACTION;
      }
      const isAction = rpm.type === RolePlayerMessageType.ACTION;
      if (rpm && !rpm.rolePlayerId && rolePlayers && rolePlayers.length === 1) {
        rpm.rolePlayerId = rolePlayers[0].id;
      }

      return [
        m(Select, {
          disabled,
          label: 'Role player',
          iconName: 'record_voice_over',
          className: checkpoint ? 'col s12' : isAction ? 'col s12 m6' : 'col s12 m3',
          placeholder: 'Pick role player',
          options: rolePlayers,
          checkedId: rpm.rolePlayerId,
          onchange: (v) => {
            rpm.rolePlayerId = v[0] as string;
            updateInject(inject);
            // update('message');
          },
        }),
        checkpoint
          ? undefined
          : m(Select, {
              disabled,
              label: 'Message type',
              iconName: getRolePlayerMessageIcon(rpm.type),
              className: isAction ? 'col s12 m6' : 'col s12 m3',
              placeholder: 'Select type',
              options: types,
              checkedId: rpm.type,
              onchange: (v) => {
                rpm.type = v[0] as RolePlayerMessageType;
                updateInject(inject);
              },
            }),
        isAction
          ? undefined
          : m(Select, {
              label: 'Participant(s)',
              id: 'person',
              disabled,
              iconName: 'people',
              className: 'col s12 m6',
              placeholder: 'Pick one or more',
              multiple: true,
              options: participants,
              initialValue: rpm.participantIds,
              onchange: (v) => {
                rpm.participantIds = v as string[];
                updateInject(inject);
              },
            }),
        m(TextInput, {
          disabled,
          id: 'headline',
          initialValue: rpm.headline || rpm.title,
          onchange: (v: string) => {
            inject.title = rpm.headline = v;
            updateInject(inject);
          },
          label: checkpoint ? 'Check' : isAction ? 'Headline' : 'Subject',
          iconName: checkpoint ? getRolePlayerMessageIcon(rpm.type) : 'title',
          className: 'col s12',
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: rpm.description as string,
          onchange: (v: string) => {
            inject.description = rpm.description = v;
            updateInject(inject);
          },
          label: 'Description',
          iconName: 'note',
        }),
      ];
    },
  };
};

/** A static view on a role player message, i.e. without the possibility to change it */
export const RolePlayerMessageView: MeiosisComponent = () => {
  const msgDetails = (rpm: IRolePlayerMsg, _rolePlayer: IPerson, participants?: IPerson[]) => {
    switch (rpm.type) {
      case RolePlayerMessageType.ACTION:
        return m('.action');
      case RolePlayerMessageType.MESSAGE:
      case RolePlayerMessageType.CALL:
        return m('.call', [
          m('h6', 'Intended for the following participants'),
          participants
            ? m(Collection, {
                mode: CollectionMode.BASIC,
                items: participants.map((p) => ({
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
        const emails = participants ? participants.filter((p) => p.email).map((p) => p.email) : undefined;
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
                items: participants.map((p) => ({
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
    view: ({ attrs: { state } }) => {
      const { injectId, trial } = state.app;
      const inject = getInject(trial, injectId);
      if (!inject) return;

      const rpm = getMessage<IRolePlayerMsg>(inject, MessageType.ROLE_PLAYER_MESSAGE);
      const rolePlayer =
        RunSvc.getUsers()
          .filter((u) => u.id === rpm.rolePlayerId)
          .shift() || ({} as IPerson);
      const participants = RunSvc.getUsers().filter((u) =>
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
