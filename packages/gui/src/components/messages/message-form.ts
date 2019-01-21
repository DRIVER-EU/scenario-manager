import m, { FactoryComponent } from 'mithril';
import { IInject, InjectType } from '../../models';
import { RolePlayerMessageForm, PhaseMessageForm } from '.';

export const MessageForm: FactoryComponent<{ inject: IInject }> = () => {
  return {
    view: ({ attrs: { inject } }) => {
      switch (inject.type) {
        case InjectType.ROLE_PLAYER_MESSAGE:
          return m(RolePlayerMessageForm, { inject });
        case InjectType.PHASE_MESSAGE:
          return m(PhaseMessageForm, { inject });
        default:
          return m('span', 'TODO');
      }
    },
  };
};
