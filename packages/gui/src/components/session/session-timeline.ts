import m, { FactoryComponent } from 'mithril';
import { SocketSvc, TrialSvc } from '../../services';
import { InjectState, IInject, InjectType, deepEqual, getAncestors, IInjectSimStates } from 'trial-manager-models';
import { Timeline, ITimelineItem, Icon } from 'mithril-materialized';
import { padLeft, getIcon, executionIcon } from '../../utils';
import { IExecutingInject } from '../../models/executing-inject';
import { TopicNames, AppState, executingChannel } from '../../models';

export const SessionTimelineView: FactoryComponent = () => {
  const timeFormatter = (d: Date) =>
    `${padLeft(d.getUTCHours())}:${padLeft(d.getUTCMinutes())}:${padLeft(d.getUTCSeconds())}`;
  const isNoGroupInject = (i: IInject) => i.type === InjectType.INJECT;
  const activeInjectState = (is: InjectState) => is === InjectState.EXECUTED || is === InjectState.IN_PROGRESS;

  const state = {
    injects: [] as IInject[],
    injectNames: {} as { [key: string]: string },
    selected: undefined as IInject | undefined,
    selectedId: undefined as string | undefined,
    socket: SocketSvc.socket,
  };

  // TODO What do we do when the user opened the wrong trial, i.e. not the one that is running?
  // Automatically load it for him?

  return {
    oninit: () => {
      const { socket } = state;
      const injects = TrialSvc.getInjects() || [];
      state.injects = injects.filter(isNoGroupInject);
      state.injectNames = state.injects.reduce(
        (acc, cur) => {
          const ancestors = getAncestors(injects, cur);
          ancestors.pop(); // Remove scenario
          acc[cur.id] = ancestors
            .reverse()
            .map(i => i.title)
            .join(' > ');
          return acc;
        },
        {} as { [key: string]: string }
      );
      socket.on('injectStates', (injectStates: IInjectSimStates) => {
        if (deepEqual(AppState.injectStates, injectStates)) {
          return;
        }
        AppState.injectStates = injectStates;
        console.table(injectStates);
        m.redraw();
      });
    },
    onremove: () => {
      const { socket } = state;
      socket.off('injectStates');
    },
    view: () => {
      const { injects, injectNames, selectedId } = state;
      const { injectStates } = AppState;
      const onSelect = (ti: ITimelineItem) => {
        const { id } = ti;
        state.selectedId = id;
        const inject = executingInjects.filter(i => i.id === id).shift() as IExecutingInject;
        if (inject) {
          console.table(inject);
          executingChannel.publish(TopicNames.ITEM_SELECT, { cur: inject });
        }
      };

      const executingInjects = injects
        .filter(i => i.type === InjectType.INJECT)
        .filter(i => injectStates.hasOwnProperty(i.id) && activeInjectState(injectStates[i.id].state))
        .map(
          i =>
            ({
              ...injectStates[i.id],
              ...i,
            } as IExecutingInject)
        )
        .sort((a, b) => (a.lastTransitionAt > b.lastTransitionAt ? 1 : -1));
      const items = executingInjects
        .sort((a, b) => (a.lastTransitionAt > b.lastTransitionAt ? 1 : -1))
        .map(
          i =>
            ({
              id: i.id,
              active: selectedId === i.id,
              datetime: new Date(i.lastTransitionAt),
              iconName: getIcon(i),
              title: m('h5', [
                i.title,
                m(Icon, { iconName: executionIcon(i), className: 'small', style: 'float: right;' }),
              ]),
              content: m('i', `From ${injectNames[i.id]}`),
            } as ITimelineItem)
        );

      return m('.row', [
        m(
          '.col.s12.sb.large',
          m(Timeline, {
            onSelect,
            timeFormatter,
            items,
          })
        ),
      ]);
    },
  };
};
