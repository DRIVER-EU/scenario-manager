import m, { FactoryComponent } from 'mithril';
import { ScenarioTimeline, ITimelineItem } from 'mithril-scenario-timeline';
import { IAppModel, MeiosisComponent } from '../../services';
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
import { getIconFromTemplate, getInjects, isScenario } from '../../utils';
import 'mithril-scenario-timeline/dist/mithril-scenario-timeline.css';

export const InjectsTimeline: MeiosisComponent = () => {
  let iid: string;
  let getIcon: (inject: IInject) => string;

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
          app: { trial, scenarioId, injectId, treeState },
        },
        actions: { update },
      },
    }) => {
      const injects = getInjects(trial) || [];
      iid = injectId;

      const selectTimelineItem = (ti: ITimelineItem) => {
        const { id } = ti;
        const inject = injects.filter((i) => i.id === ti.id).shift();
        if (inject && inject.type !== InjectType.INJECT && iid === id) {
          treeState[id] = !treeState[id];
        }
        update({ app: { injectId: id } } as IAppModel);
        m.redraw();
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
        return ti;
      };

      const scenarios: IScenario[] = injects ? injects.filter(isScenario) : [];
      const scenario = scenarios.filter((s) => s.id === scenarioId).shift() || scenarios[0];
      if (injects.length === 0 || !scenario) {
        return;
      }
      const scenarioStart = new Date(scenario.startDate || new Date());
      const timelineStart = new Date(Math.floor(scenarioStart.valueOf() / 60000) * 60000);
      const timeline = scenarioToTimelineItems(scenario, injects);
      return m(
        '.row.timeline.sb.large',
        scenario
          ? m(
              '.col.s12',
              m(ScenarioTimeline, {
                titleView,
                lineHeight: 31,
                timeline,
                onClick: selectTimelineItem,
                timelineStart,
                scenarioStart,
              })
            )
          : undefined
      );
    },
  };
};
