import m, { FactoryComponent } from 'mithril';
import { SocketSvc, TrialSvc } from '../../services';
import { IStateUpdate, InjectState, IInject, InjectType } from 'trial-manager-models';
import { Timeline, ITimelineItem, Collection, CollectionMode, ICollectionItem } from 'mithril-materialized';
import { padLeft } from '../../utils';
import { IExecutingInject } from '../../models/executing-inject';
import { getIcon, executionIcon } from './../../utils/utils';
import { injectsChannel, TopicNames } from '../../models';

export const SessionState: FactoryComponent = () => {
  const timeFormatter = (d: Date) =>
    `${padLeft(d.getUTCHours())}:${padLeft(d.getUTCMinutes())}:${padLeft(d.getUTCSeconds())}`;
  const isNoGroupInject = (i: IInject) => i.type === InjectType.INJECT;
  const activeInjectState = (is: InjectState) =>
    is === InjectState.SCHEDULED || is === InjectState.EXECUTED || is === InjectState.IN_PROGRESS;

  const injectSelected = (selected?: IInject, isSelected?: boolean) => {
    if (!selected) { return; }
    state.selected = selected;
    injectsChannel.publish(TopicNames.ITEM_SELECT, isSelected ? { cur: selected } : { cur: {} as IInject });
  };

  const state = {
    selected: undefined as IInject | undefined,
    socket: SocketSvc.socket,
    injectStates: {} as { [id: string]: IStateUpdate },
  };

  return {
    oninit: () => {
      const { socket } = state;
      socket.on('injectStates', (injectStates: { [id: string]: IStateUpdate }) => {
        state.injectStates = injectStates;
        // console.table(injectStates);
        m.redraw();
      });
    },
    onremove: () => {
      const { socket } = state;
      socket.off('injectStates');
    },
    view: () => {
      const { injectStates } = state;
      const injects = (TrialSvc.getInjects() || [])
        .filter(isNoGroupInject)
        .filter(i => injectStates.hasOwnProperty(i.id) && activeInjectState(injectStates[i.id].state))
        .map(
          i =>
            ({
              ...injectStates[i.id],
              ...i,
            } as IExecutingInject)
        )
        .sort((a, b) => (a.lastTransitionAt > b.lastTransitionAt ? 1 : -1));
      const items = injects
        .reduce(
          (acc, cur) => {
            const { lastTransitionAt } = cur;
            const joinWithLast = acc.length > 0 && acc[acc.length - 1].lastTransitionAt === lastTransitionAt;
            const item = joinWithLast ? acc[acc.length - 1] : { lastTransitionAt, injects: [cur] };
            if (!joinWithLast) {
              acc.push(item);
            }
            return acc;
          },
          [] as Array<{
            lastTransitionAt: Date;
            injects: IExecutingInject[];
          }>
        )
        .map(
          li =>
            ({
              datetime: new Date(li.lastTransitionAt),
              iconName: 'play_arrow',
              content: m(Collection, {
                style: 'color: black;',
                mode: CollectionMode.AVATAR,
                items: li.injects.map(
                  i =>
                    ({
                      title: i.title,
                      avatar: getIcon(i),
                      iconName: executionIcon(i),
                      content: i.state,
                      onclick: injectSelected(i),
                    } as ICollectionItem)
                ),
              }),
            } as ITimelineItem)
        );

      return m('.row', [
        m(
          '.col.s12.l6',
          m(Timeline, {
            timeFormatter,
            items,
          })
        ),
      ]);
    },
  };
};
