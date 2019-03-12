import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, Collection, CollectionMode } from 'mithril-materialized';
import {
  getMessage,
  IInject,
  MessageType,
  UserRole,
  IRolePlayerMessage,
  RolePlayerMessageType,
  IPerson,
  ITestbedRolePlayerMessage,
} from 'trial-manager-models';
import { iterEnum, userRolesFilter, userIcon } from '../../utils';
import { TrialSvc } from '../../services';
import { injectsChannel, TopicNames } from './../../models';
import { rolePlayerMessageToTestbed, RolePlayState } from './../../../../models/src/role-player-message';

export const RolePlayerExeMessageForm: FactoryComponent = () => {
  const state = {
    subscription: injectsChannel.subscribe(TopicNames.ITEM_SELECT, ({ cur }) => {
      state.inject = cur;
      m.redraw();
    }),
    inject: {} as IInject,
  };

  return {
    onremove: () => state.subscription.unsubscribe(),
    view: () => {
      const { inject } = state;
      const rpm = getMessage(inject, MessageType.ROLE_PLAYER_MESSAGE) as IRolePlayerMessage;
      const rolePlayer = (TrialSvc.getUsers() || []).filter(u => u.id === rpm.rolePlayerId).shift();
      const participants = (TrialSvc.getUsers() || []).filter(
        u => rpm.participantIds && rpm.participantIds.indexOf(u.id) >= 0
      );
      const msg = rolePlayerMessageToTestbed(
        rpm,
        RolePlayState.IN_PROGRESS,
        rolePlayer ? rolePlayer.name : '',
        participants.map(p => p.name)
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
  msg: ITestbedRolePlayerMessage;
  participants: IPerson[];
}> = () => {
  return {
    view: ({ attrs: { rolePlayer, msg, participants } }) => [
      m('h5', 'CALL: ' + msg.title),
      m('h6', msg.headline),
      m('p', msg.description),
      m(Collection, {
        header: 'Call',
        mode: CollectionMode.AVATAR,
        items: participants.map(p => ({
          title: p.name,
          content: `${p.mobile ? `MOBILE: ${p.mobile}<br/>` : ''}${p.phone ? `PHONE: ${p.phone}` : ''}`,
          avatar: userIcon(p),
        })),
      }),
    ],
  };
};

// const CallMessage: FactoryComponent<{
//   rolePlayer: IPerson;
//   msg: MessageType.ROLE_PLAYER_MESSAGE;
//   participants: IPerson[];
// }> = () => {
//   return {
//     view: ({ attrs: { rolePlayer, msg, participants } }) => {

//     },
//   };
// };
