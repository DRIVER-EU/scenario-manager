import m, { FactoryComponent } from 'mithril';
import { ScenarioTimeline, ITimelineItem } from 'mithril-scenario-timeline';
import { MeiosisComponent } from '../../services';
import {
  InjectType,
  IInjectGroup,
  IInject,
  toMsec,
  IScenario,
  InjectState,
  InjectConditionType,
} from '../../../../models';
import { Icon } from 'mithril-materialized';
import { getIcon, getInjects, isScenario } from '../../utils';
import 'mithril-scenario-timeline/dist/mithril-scenario-timeline.css';

export const InjectsTimeline: MeiosisComponent = () => {
  const titleView: FactoryComponent<{ item: ITimelineItem }> = () => {
    return {
      view: ({ attrs: { item } }) => {
        const { title } = item;
        const inject = item as IInject;
        const isManual = inject.condition && inject.condition.type === InjectConditionType.MANUALLY;
        return m('div', [
          m(Icon, {
            style: 'vertical-align: middle; margin-right: 5px;',
            iconName: getIcon(inject),
            className: 'tiny',
          }),
          m('span', title),
          isManual
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
          app: { trial, scenarioId, treeState },
        },
        actions: { toggleTreeItem },
      },
    }) => {
      const injects = getInjects(trial) || [];
      const onClick = (item: ITimelineItem) => {
        const inject = injects.filter((i) => i.id === item.id).shift();
        if (inject && inject.type !== InjectType.INJECT) {
          toggleTreeItem(inject.id);
          // treeState[inject.id] = !treeState[inject.id];
          // m.redraw();
        }
      };

      const injectToTimelineItem = (i: IInject | IInjectGroup) => {
        const { condition } = i;
        return {
          ...i,
          isOpen: treeState[i.id],
          delay: condition && condition.delay ? toMsec(condition.delay, condition.delayUnitType) / 1000 : 0,
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

      const scenarioToTimelineItems = (scenario: IInjectGroup, items: Array<IInjectGroup | IInject>) => {
        const getChildren = (id: string | number): Array<IInjectGroup | IInject> => {
          const children = items.filter((i) => i.parentId === id);
          return children.reduce((acc, c) => [...acc, ...getChildren(c.id)], children);
        };
        const ti = [scenario, ...getChildren(scenario.id)].map(injectToTimelineItem);
        // console.log(JSON.stringify(ti, null, 2));
        return ti;
      };

      const scenarios: IScenario[] = injects ? injects.filter(isScenario) : [];
      const scenario = scenarios.filter((s) => s.id === scenarioId).shift() || scenarios[0];
      if (injects.length === 0 || !scenario) {
        return;
      }
      const scenarioStart = new Date(scenario.startDate || new Date());
      const timelineStart = new Date(Math.floor(scenarioStart.valueOf() / 60000) * 60000);
      return m(
        '.row.timeline.sb.large',
        scenario
          ? m(
              '.col.s12',
              m(ScenarioTimeline, {
                titleView,
                lineHeight: 31,
                timeline: scenarioToTimelineItems(scenario, injects),
                onClick,
                timelineStart,
                scenarioStart,
              })
            )
          : undefined
      );
    },
  };
};
