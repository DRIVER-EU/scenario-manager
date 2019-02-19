import m, { FactoryComponent } from 'mithril';
import { SocketSvc } from '../../services';
import { IStateUpdate } from 'trial-manager-models';

export const SessionState: FactoryComponent = () => {
  const state = {
    socket: SocketSvc.socket,
    injectStates: {} as { [id: string]: IStateUpdate },
  };

  return {
    oninit: () => {
      const { socket } = state;
      socket.on('injectStates', (injectStates: { [id: string]: IStateUpdate }) => {
        state.injectStates = injectStates;
        console.table(injectStates);
      });
    },
    onremove: () => {
      const { socket } = state;
      socket.off('injectStates');
    },
    view: () => {
      const { injectStates } = state;
      return m('pre', Object.keys(injectStates).map(k => injectStates[k]).join('<br>'));
    },
  };
};
