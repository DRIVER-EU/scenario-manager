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
  TimeState,
} from '../../../../models';
import { ScenarioTimeline, ITimelineItem, IExecutingTimelineItem } from 'mithril-scenario-timeline';
import { Icon } from 'mithril-materialized';
import { getIconFromTemplate, getInject, getInjects, injectToTimelineItemFactory } from '../../utils';

export const SessionTimelineView: MeiosisComponent = () => {
  let iid: string;
  let time = undefined as number | undefined | null;
  let simulationSpeed = 1;
  let lastTimeUpdate = Date.now();
  let timeInterval: number;
  let executingInjects = [] as Array<IExecutingInject & IInjectSimState>;
  let getIcon: (inject: IInject) => string;

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
    oninit: ({
      attrs: {
        state: {
          app: { templates },
        },
      },
    }) => {
      getIcon = getIconFromTemplate(templates);
    },
    view: ({
      attrs: {
        state: {
          exe: { injectStates, trial, scenarioId, injectId, treeState, scenarioStartTime: sst, time: t },
        },
        actions: { update },
      },
    }) => {
      time = t.simulationTime;
      lastTimeUpdate = t.state === TimeState.Started ? Date.now() : 0;
      iid = injectId;

      const selectTimelineItem = (ti: IExecutingTimelineItem) => {
        const { id, startTime = 0 } = ti;
        const inject = executingInjects.filter((i) => i.id === id).shift();
        if (inject) {
          const t = new Date(scenarioStart.valueOf());
          t.setSeconds(scenarioStart.getSeconds() + startTime);
          inject.expectedExecutionTimeAt = t;
          update({ exe: { injectId: inject.id, startTime } } as Partial<IAppModel>);
          if (inject.type !== InjectType.INJECT && iid === id) {
            treeState[id] = !treeState[id];
          }
          m.redraw();
        }
      };

      executingInjects = (getInjects(trial) as Array<IExecutingInject & IInjectSimState>) || [];
      const scenario = getInject(trial, scenarioId) as IExecutingInject & IScenario;
      const scenarioStart = scenario && scenario.startDate ? new Date(scenario.startDate) : Object.prototype.toString.call(sst) === "[object Date]" ? sst : new Date();
      const timelineStart = new Date(Math.floor(scenarioStart.valueOf() / 60000) * 60000);
      const timeline = scenarioToTimelineItems(scenario, executingInjects, injectStates, treeState);

      return m('.row', [
        scenario
          ? m(
              '.col.s12.sb.large',
              m(ScenarioTimeline, {
                // width: 500,
                lineHeight: 31,
                timeline,
                onClick: selectTimelineItem,
                time: scenarioTimer,
                titleView,
                timelineStart,
                scenarioStart,
              })
            )
          : m('p.center', 'No active scenario loaded'),
      ]);
    },
  };
};
