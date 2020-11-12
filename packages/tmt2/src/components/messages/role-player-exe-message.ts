import m, { FactoryComponent } from 'mithril';
import { Collection, CollectionMode } from 'mithril-materialized';
import {
  getMessage,
  MessageType,
  RolePlayerMessageType,
  IPerson,
  IRolePlayerMsg,
  rolePlayerMessageToTestbed,
} from '../../../../models';
import { MeiosisComponent } from '../../services';
import { getInject, getUsers, userIcon } from '../../utils';

export const RolePlayerExeMessageForm: MeiosisComponent = () => {
  return {
    view: ({ attrs: { state } }) => {
      const { mode } = state.app;
      const isExecuting = mode === 'execute';
      const { trial, scenarioId } = isExecuting && state.exe.trial.id ? state.exe : state.app;
      const inject = getInject(trial, scenarioId);
      if (!inject) return;
      const rpm = getMessage(inject, MessageType.ROLE_PLAYER_MESSAGE) as IRolePlayerMsg;
      const rolePlayer = getUsers(trial)
        .filter((u) => u.id === rpm.rolePlayerId)
        .shift();
      const participants = getUsers(trial).filter((u) => rpm.participantIds && rpm.participantIds.indexOf(u.id) >= 0);
      const msg = rolePlayerMessageToTestbed(
        rpm,
        rolePlayer ? rolePlayer.name : 'UNKNOWN',
        participants.map((p) => p.name)
      );
      return [
        rpm.type === RolePlayerMessageType.CALL ? m(CallMessage, { rolePlayer, msg, participants }) : undefined,
        // m(TextArea, { initialValue: inject.})
      ];
    },
  };
};

const CallMessage: FactoryComponent<{
  rolePlayer?: IPerson;
  msg: IRolePlayerMsg;
  participants: IPerson[];
}> = () => {
  return {
    view: ({ attrs: { msg, participants } }) => [
      m('h5', 'CALL: ' + msg.title),
      m('h6', msg.headline),
      m('p', msg.description),
      m(Collection, {
        header: 'Call',
        mode: CollectionMode.AVATAR,
        items: participants.map((p) => ({
          title: p.name,
          content: `${p.mobile ? `MOBILE: ${p.mobile}<br/>` : ''}${p.phone ? `PHONE: ${p.phone}` : ''}`,
          avatar: userIcon(p),
        })),
      }),
    ],
  };
};
