import m, { FactoryComponent } from 'mithril';
import { SocketSvc } from '../../services';
import { IStateUpdate } from 'trial-manager-models';
import { Timeline, ITimelineItem } from 'mithril-materialized';
import { padLeft } from '../../utils';

export const SessionState: FactoryComponent = () => {
  const timeFormatter = (d: Date) =>
    `${padLeft(d.getUTCHours())}:${padLeft(d.getUTCMinutes())}:${padLeft(d.getUTCSeconds())}`;

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
        m.redraw();
      });
    },
    onremove: () => {
      const { socket } = state;
      socket.off('injectStates');
    },
    view: () => {
      const { injectStates } = state;
      return m(Timeline, {
        timeFormatter,
        items: Object.keys(injectStates)
          .map(k => injectStates[k])
          .sort((a, b) => a.lastTransitionAt > b.lastTransitionAt ? 1 : 0)
          .map(s => ({
            title: s.title,
            datetime: new Date(s.lastTransitionAt),
            iconName: 'ac_unit',
            content: '',
          } as ITimelineItem)),
      });
    },
  };
};
