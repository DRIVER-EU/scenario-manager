import m, { FactoryComponent } from 'mithril';
import { ScenarioTimeline, ITimelineItem } from 'mithril-scenario-timeline';
import { TrialSvc } from '../../services';
import { InjectType, IInjectGroup, IInject, toMsec, IScenario, InjectState } from 'trial-manager-models';

export const InjectsTimeline: FactoryComponent = () => {
  const injectToTimelineItem = (i: IInject | IInjectGroup) => {
    const { id, title, parentId, isOpen, condition } = i;
    return {
      id,
      title,
      parentId,
      isOpen,
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
    const getChildren = (id: string): Array<IInjectGroup | IInject> => {
      const children = items.filter(i => i.parentId === id);
      return children.reduce((acc, c) => [...acc, ...getChildren(c.id)], children);
    };
    const ti = [scenario, ...getChildren(scenario.id)].map(injectToTimelineItem);
    // console.log(JSON.stringify(ti, null, 2));
    return ti;
  };

  return {
    view: () => {
      const injects = TrialSvc.getInjects() || [];
      const onClick = (item: ITimelineItem) => {
        const inject = injects.filter(i => i.id === item.id).shift();
        if (inject && inject.type !== InjectType.INJECT) {
          inject.isOpen = !inject.isOpen;
          m.redraw();
        }
      };

      const scenarios: IScenario[] = injects ? injects.filter(i => i.type === InjectType.SCENARIO) : [];
      return m(
        '.row.timeline',
        scenarios.map(
          scenario =>
            scenario.isOpen
              ? m(
                  '.col.s12',
                  m(ScenarioTimeline, {
                    lineHeight: 31,
                    timeline: scenarioToTimelineItems(scenario, injects),
                    onClick,
                    scenarioStart: new Date(scenario.startDate || new Date()),
                  })
                )
              : undefined
          // : m('.scenario-title', scenario.title)
        )
      );
    },
  };
};
