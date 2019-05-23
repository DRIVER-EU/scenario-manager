import m, { FactoryComponent } from 'mithril';
import { SocketSvc, TrialSvc } from '../../services';
import {
  InjectState,
  IInject,
  InjectType,
  deepEqual,
  IInjectSimStates,
  InjectConditionType,
  toMsec,
  ITimeMessage,
} from 'trial-manager-models';
import { IExecutingInject } from '../../models/executing-inject';
import { TopicNames, AppState, executingChannel } from '../../models';
import { ScenarioTimeline, ITimelineItem, IExecutingTimelineItem } from 'mithril-scenario-timeline';
import { Icon } from 'mithril-materialized';
import { getIcon } from '../../utils';

export const SessionTimelineView: FactoryComponent = () => {
  const state = {
    time: undefined as number | undefined,
    timeInterval: undefined as number | undefined,
    injects: [] as IInject[],
    executingInjects: [] as IExecutingInject[],
    selected: undefined as IInject | undefined,
    socket: SocketSvc.socket,
  };

  // TODO What do we do when the user opened the wrong trial, i.e. not the one that is running?
  // Automatically load it for him?

  const waitingForManualConfirmation = (i: IExecutingInject) =>
    i.state === InjectState.SCHEDULED && i.condition && i.condition.type === InjectConditionType.MANUALLY;

  const updateTime = (t: ITimeMessage) => {
    state.time = t.trialTime;
  };

  const time = (update: (t: number | Date) => void) => {
    state.timeInterval = window.setInterval(() => {
      if (state.time) {
        update(new Date(state.time));
      }
    }, 1000);
  };

  const titleView: FactoryComponent<{ item: ITimelineItem }> = () => {
    return {
      view: ({ attrs: { item } }) => {
        const { title, highlight } = item;
        const inject = item as IInject;
        const isManual = inject.condition && inject.condition.type === InjectConditionType.MANUALLY;
        const isCompleted = item.completed === 1;
        const grayedOut = isCompleted ? 'grey-text' : '';
        return m('div', { className: highlight ? 'red-text' : '' }, [
          m(Icon, {
            style: 'vertical-align: middle; margin-right: 5px;',
            iconName: getIcon(inject),
            className: 'tiny ' + grayedOut,
          }),
          m('span', { className: grayedOut }, title),
          isManual && !isCompleted
            ? m(Icon, {
                style: 'vertical-align: middle; margin-left: 5px;',
                iconName: 'block',
                className: 'tiny',
              })
            : undefined,
        ]);
      },
    };
  };

  const injectToTimelineItem = (i: IExecutingInject) => {
    const { condition, id } = i;
    const { injectStates } = AppState;
    const delay = injectStates && injectStates.hasOwnProperty(id) ? injectStates[id].delayInSeconds || 0 : 0;
    const condDelay = condition && condition.delay ? toMsec(condition.delay, condition.delayUnitType) / 1000 : 0;
    return {
      ...i,
      completed: i.state === InjectState.EXECUTED ? 1 : 0,
      highlight: waitingForManualConfirmation(i),
      delay: delay + condDelay,
      dependsOn:
        condition && condition.injectId
          ? [
              {
                id: condition.injectId,
                condition: condition.injectState === InjectState.EXECUTED ? 'finished' : 'started',
              },
            ]
          : undefined,
    } as ITimelineItem;
  };

  const scenarioToTimelineItems = (scenario: IExecutingInject, items: IExecutingInject[]) => {
    const getChildren = (id: string): IExecutingInject[] => {
      const children = items.filter(i => i.parentId === id);
      return children.reduce((acc, c) => [...acc, ...getChildren(c.id)], children);
    };
    const ti = [scenario, ...getChildren(scenario.id)].map(injectToTimelineItem);
    // console.log(JSON.stringify(ti, null, 2));
    return ti;
  };

  const onClick = (scenarioStartTime: Date) => (ti: IExecutingTimelineItem) => {
    const { id, startTime = 0, lastTransitionAt } = ti;
    const { injects, executingInjects } = state;
    const inject = executingInjects.filter(i => i.id === id).shift() as IExecutingInject;
    if (inject) {
      const t = new Date(scenarioStartTime.valueOf());
      t.setSeconds(scenarioStartTime.getSeconds() + startTime);
      const lastTransition = new Date(lastTransitionAt);
      inject.expectedExecutionTimeAt = t > lastTransition ? t : lastTransition;
      executingChannel.publish(TopicNames.ITEM_SELECT, { cur: inject });
      if (inject.type !== InjectType.INJECT) {
        const selInject = injects.filter(i => i.id === inject.id).shift();
        if (selInject) {
          selInject.isOpen = !selInject.isOpen;
        }
      }
      m.redraw();
    }
  };

  return {
    oninit: () => {
      const { socket } = state;
      const injects = TrialSvc.getInjects() || [];
      state.injects = injects; // .filter(isNoGroupInject);
      socket.on('injectStates', (injectStates: IInjectSimStates) => {
        if (deepEqual(AppState.injectStates, injectStates)) {
          return;
        }
        AppState.injectStates = injectStates;
        // console.table(injectStates);
        m.redraw();
      });
      socket.on('time', updateTime);
    },
    onremove: () => {
      const { socket } = state;
      socket.off('injectStates');
      socket.off('time', updateTime);
      window.clearInterval(state.timeInterval);
    },
    view: () => {
      const { injects } = state;
      const { injectStates } = AppState;

      const executingInjects = injects
        .filter(i => injectStates.hasOwnProperty(i.id))
        .map(
          i =>
            ({
              ...injectStates[i.id],
              ...i,
            } as IExecutingInject)
        );
      // console.table(executingInjects);
      state.executingInjects = executingInjects;
      const activeScenario = executingInjects
        ? executingInjects.filter(i => i.type === InjectType.SCENARIO).shift()
        : undefined;

      const scenarioStartTime =
        activeScenario && activeScenario.state !== InjectState.EXECUTED
          ? new Date(activeScenario.lastTransitionAt)
          : AppState.scenarioStartTime;
      AppState.scenarioStartTime = scenarioStartTime;

      return m('.row', [
        activeScenario
          ? m(
              '.col.s12.sb.large',
              m(ScenarioTimeline, {
                lineHeight: 31,
                timeline: scenarioToTimelineItems(activeScenario, executingInjects),
                onClick: onClick(scenarioStartTime),
                time,
                titleView,
                scenarioStart: new Date(scenarioStartTime),
              })
            )
          : undefined,
      ]);
    },
  };
};
