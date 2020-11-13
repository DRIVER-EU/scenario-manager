import m, { FactoryComponent } from 'mithril';
import { MeiosisComponent, IAppModel } from '../../services';
import {
  IInject,
  InjectType,
  InjectConditionType,
  IInjectSimState,
  IExecutingInject,
  IScenario,
  IInjectSimStates,
} from '../../../../models';
import { ScenarioTimeline, ITimelineItem, IExecutingTimelineItem } from 'mithril-scenario-timeline';
import { Icon } from 'mithril-materialized';
import { getIcon, getInjects, injectToTimelineItemFactory } from '../../utils';

export const SessionTimelineView: MeiosisComponent = () => {
  let time = undefined as number | undefined | null;
  let simulationSpeed = 1;
  let lastTimeUpdate = Date.now();
  let timeInterval: number;
  let injects = [] as IInject[];
  let executingInjects = [] as Array<IExecutingInject & IInjectSimState>;

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

  const scenarioToTimelineItems = (
    scenario: IExecutingInject,
    items: IExecutingInject[],
    injectStates: IInjectSimStates,
    treeState: { [key: string]: boolean }
  ) => {
    const getChildren = (id: string): IExecutingInject[] => {
      const children = items.filter((i) => i.parentId === id);
      return children.reduce((acc, c) => [...acc, ...getChildren(c.id as string)], children);
    };
    const injectToTimelineItem = injectToTimelineItemFactory(injectStates, treeState);
    const ti = [scenario, ...getChildren(scenario.id as string)].map(injectToTimelineItem);
    // console.log(JSON.stringify(ti, null, 2));
    return ti;
  };

  const titleView: FactoryComponent<{ item: ITimelineItem }> = () => {
    return {
      onremove: () => clearInterval(timeInterval),
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

  return {
    view: ({
      attrs: {
        state: {
          exe: { injectStates, trial, scenarioId, treeState, scenarioStartTime: sst, time: t },
        },
        actions: { update },
      },
    }) => {
      time = t.simulationTime;
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
          update({ exe: { injectId: inject.id } } as Partial<IAppModel>);
          m.redraw();
        }
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
      const activeScenario = executingInjects ? executingInjects.filter((i) => i.id === scenarioId).shift() : undefined;

      const scenario = activeScenario as IScenario;
      const scenarioStartTime = scenario && scenario.startDate ? new Date(scenario.startDate) : sst;
      const timelineStart = new Date(Math.floor(scenarioStartTime.valueOf() / 60000) * 60000);

      return m('.row', [
        activeScenario
          ? m(
              '.col.s12.sb.large',
              m(ScenarioTimeline, {
                // width: 500,
                lineHeight: 31,
                timeline: scenarioToTimelineItems(activeScenario, executingInjects, injectStates, treeState),
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
