import m, { FactoryComponent } from 'mithril';
import { SocketSvc, RunSvc } from '../../services';
import {
  InjectState,
  IInject,
  InjectType,
  deepEqual,
  IInjectSimStates,
  InjectConditionType,
  toMsec,
  ITimeMessage,
  IInjectSimState,
  IExecutingInject,
  IScenario,
} from 'trial-manager-models';
import { TopicNames, AppState, executingChannel } from '../../models';
import { ScenarioTimeline, ITimelineItem, IExecutingTimelineItem } from 'mithril-scenario-timeline';
import { Icon } from 'mithril-materialized';
import { getIcon } from '../../utils';

export const SessionTimelineView: FactoryComponent = () => {
  const state = {
    time: undefined as number | undefined,
    lastTimeUpdate: undefined as number | undefined,
    timeInterval: undefined as number | undefined,
    injects: [] as IInject[],
    executingInjects: [] as Array<IExecutingInject & IInjectSimState>,
    selected: undefined as IInject | undefined,
    socket: SocketSvc.socket,
  };

  // TODO What do we do when the user opened the wrong trial, i.e. not the one that is running?
  // Automatically load it for him?

  const waitingForManualConfirmation = (i: IExecutingInject) =>
    i.state === InjectState.SCHEDULED && i.condition && i.condition.type === InjectConditionType.MANUALLY;

  const updateTime = (t: ITimeMessage) => {
    state.lastTimeUpdate = Date.now();
    state.time = t.trialTime;
  };

  const time = (update: (t: number | Date) => void) => {
    state.timeInterval = window.setInterval(() => {
      const { time: trialTime, lastTimeUpdate } = state;
      if (trialTime && lastTimeUpdate && AppState.time) {
        const now = Date.now();
        const newTime = trialTime + (now - lastTimeUpdate) * (AppState.time.trialTimeSpeed || 1);
        update(new Date(newTime));
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
    const isCompleted = i.state === InjectState.EXECUTED;
    const delay = injectStates && injectStates.hasOwnProperty(id) ? injectStates[id].delayInSeconds || 0 : 0;
    const condDelay = condition && condition.delay ? toMsec(condition.delay, condition.delayUnitType) / 1000 : 0;
    return {
      ...i,
      completed: isCompleted ? 1 : 0,
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

  const onClick = (ti: IExecutingTimelineItem) => {
    const { scenarioStartTime } = AppState;
    const { id, startTime = 0 } = ti;
    const { injects, executingInjects } = state;
    const inject = executingInjects.filter(i => i.id === id).shift();
    if (inject) {
      const t = new Date(scenarioStartTime.valueOf());
      t.setSeconds(scenarioStartTime.getSeconds() + startTime);
      inject.expectedExecutionTimeAt = t;
      // const lastTransition = new Date(lastTransitionAt);
      // inject.expectedExecutionTimeAt = t > lastTransition ? t : lastTransition;
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

  // const updatedInjectReceived = (inject: IInject) => {
  //   const injects = RunSvc.getInjects() || [];
  //   const found = injects.filter(i => i.id === inject.id);
  //   if (found.length > 0) {
  //     const i = injects.indexOf(found[0]);
  //     injects[i] = inject;
  //   }
  // };

  return {
    oninit: () => {
      const { socket } = state;
      const injects = RunSvc.getInjects() || [];
      state.injects = injects; // .filter(isNoGroupInject);
      socket.on('injectStates', (injectStates: IInjectSimStates) => {
        if (deepEqual(AppState.injectStates, injectStates)) {
          return;
        }
        AppState.injectStates = injectStates;
        m.redraw();
      });
      socket.on('time', updateTime);
      socket.on('updatedInject', RunSvc.updatedInjectReceived);
      socket.on('createdInject', RunSvc.newInjectReceived);
    },
    onremove: () => {
      const { socket } = state;
      socket.off('injectStates');
      socket.off('time', updateTime);
      socket.off('updatedInject', RunSvc.updatedInjectReceived);
      socket.off('createdInject', RunSvc.newInjectReceived);
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
              ...i,
              ...injectStates[i.id],
            } as IExecutingInject & IInjectSimState)
        );
      // console.table(executingInjects);
      state.executingInjects = executingInjects;
      const activeScenario = executingInjects
        ? executingInjects.filter(i => i.type === InjectType.SCENARIO).shift()
        : undefined;

      const scenario = activeScenario as IScenario;
      const scenarioStartTime =
        activeScenario && scenario.startDate
          ? new Date(scenario.startDate)
          : AppState.scenarioStartTime;
      AppState.scenarioStartTime = scenarioStartTime;
      const timelineStart = new Date(Math.floor(scenarioStartTime.valueOf() / 60000) * 60000);

      console.log(scenarioStartTime);
      console.table(activeScenario && scenarioToTimelineItems(activeScenario, executingInjects));

      return m('.row', [
        activeScenario &&
          m(
            '.col.s12.sb.large',
            m(ScenarioTimeline, {
              // width: 500,
              lineHeight: 31,
              timeline: scenarioToTimelineItems(activeScenario, executingInjects),
              onClick,
              time,
              titleView,
              timelineStart,
              scenarioStart: new Date(scenarioStartTime),
            })
          ),
      ]);
    },
  };
};
