import m, { FactoryComponent } from 'mithril';
import { SocketSvc, RunSvc, MeiosisComponent } from '../../services';
import {
  IInject,
  InjectType,
  deepEqual,
  IInjectSimStates,
  InjectConditionType,
  ITimeManagement,
  IInjectSimState,
  IExecutingInject,
  IScenario,
} from '../../../../models';
import { ScenarioTimeline, ITimelineItem, IExecutingTimelineItem } from 'mithril-scenario-timeline';
import { Icon } from 'mithril-materialized';
import { getIcon, getInjects, injectToTimelineItemFactory } from '../../utils';

export const SessionTimelineView: MeiosisComponent = () => {
  let time = undefined as number | undefined;
  let simulationSpeed = 1;
  let lastTimeUpdate = Date.now();
  let timeInterval = undefined as number | undefined;
  let injects = [] as IInject[];
  let executingInjects = [] as Array<IExecutingInject & IInjectSimState>;
  let socket = SocketSvc.socket;

  // TODO What do we do when the user opened the wrong trial, i.e. not the one that is running?
  // Automatically load it for him?

  const updateTime = (t = {} as ITimeManagement) => {
    lastTimeUpdate = Date.now();
    time = t.simulationTime || 0;
    simulationSpeed = t.simulationSpeed || 1;
  };

  const scenarioTimer = (update: (t: number | Date) => void) => {
    timeInterval = window.setInterval(() => {
      // const { time: simulationTime = time.simulationTime, lastTimeUpdate } = state;
      if (time && lastTimeUpdate) {
        const now = Date.now();
        const newTime = time + (now - lastTimeUpdate) * simulationSpeed;
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

  const updatedInjectReceived = (i: IInject) => RunSvc.updatedInjectReceived(i);
  const newInjectReceived = (i: IInject) => RunSvc.newInjectReceived(i);

  return {
    oninit: ({
      attrs: {
        state: {
          exe: { injectStates: is },
        },
        actions: { setInjectStates },
      },
    }) => {
      socket.on('injectStates', (injectStates: IInjectSimStates) => {
        if (deepEqual(is, injectStates)) {
          return;
        }
        setInjectStates(injectStates);
        m.redraw();
      });
      socket.on('time', updateTime);
      socket.on('updatedInject', updatedInjectReceived);
      socket.on('createdInject', newInjectReceived);
    },
    onremove: () => {
      socket.off('injectStates');
      socket.off('time', updateTime);
      socket.off('updatedInject', updatedInjectReceived);
      socket.off('createdInject', newInjectReceived);
      window.clearInterval(timeInterval);
    },
    view: ({
      attrs: {
        state: {
          exe: { injectStates, trial, scenarioStartTime: sst },
        },
        actions: { setScenarioStartTime },
      },
    }) => {
      const onClick = (ti: IExecutingTimelineItem) => {
        const { id, startTime = 0 } = ti;
        const inject = executingInjects.filter((i) => i.id === id).shift();
        if (inject) {
          const t = new Date(scenarioStartTime.valueOf());
          t.setSeconds(scenarioStartTime.getSeconds() + startTime);
          inject.expectedExecutionTimeAt = t;
          // const lastTransition = new Date(lastTransitionAt);
          // inject.expectedExecutionTimeAt = t > lastTransition ? t : lastTransition;
          // executingChannel.publish(TopicNames.ITEM_SELECT, { cur: inject });
          if (inject.type !== InjectType.INJECT) {
            const selInject = injects.filter((i) => i.id === inject.id).shift();
            if (selInject) {
              selInject.isOpen = !selInject.isOpen;
            }
          }
          m.redraw();
        }
      };

      const scenarioToTimelineItems = (scenario: IExecutingInject, items: IExecutingInject[]) => {
        const getChildren = (id: string): IExecutingInject[] => {
          const children = items.filter((i) => i.parentId === id);
          return children.reduce((acc, c) => [...acc, ...getChildren(c.id as string)], children);
        };
        const injectToTimelineItem = injectToTimelineItemFactory(injectStates);
        const ti = [scenario, ...getChildren(scenario.id as string)].map(injectToTimelineItem);
        // console.log(JSON.stringify(ti, null, 2));
        return ti;
      };

      injects = getInjects(trial) || [];

      executingInjects = injects
        .filter((i) => injectStates.hasOwnProperty(i.id))
        .map(
          (i) =>
            ({
              ...i,
              ...injectStates[i.id],
            } as IExecutingInject & IInjectSimState)
        );
      const activeScenario = executingInjects
        ? executingInjects.filter((i) => i.type === InjectType.SCENARIO).shift()
        : undefined;

      const scenario = activeScenario as IScenario;
      const scenarioStartTime = activeScenario && scenario.startDate ? new Date(scenario.startDate) : sst;
      setScenarioStartTime(scenarioStartTime);
      const timelineStart = new Date(Math.floor(scenarioStartTime.valueOf() / 60000) * 60000);

      return m('.row', [
        activeScenario
          ? m(
              '.col.s12.sb.large',
              m(ScenarioTimeline, {
                // width: 500,
                lineHeight: 31,
                timeline: scenarioToTimelineItems(activeScenario, executingInjects),
                onClick,
                time: scenarioTimer,
                titleView,
                timelineStart,
                scenarioStart: new Date(scenarioStartTime),
              })
            )
          : m('p.center', 'No active scenario loaded'),
      ]);
    },
  };
};
