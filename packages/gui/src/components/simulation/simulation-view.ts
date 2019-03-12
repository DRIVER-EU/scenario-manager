import m, { FactoryComponent } from 'mithril';
import {
  ITrial,
  IScenario,
  InjectType,
  pruneInjects,
  InjectConditionType,
  getAncestors,
  IInject,
} from 'trial-manager-models';
import { TrialSvc } from '../../services';
import { simulationEngine } from './simulation-engine';
import {
  Select,
  ISelectOptions,
  ICollectionItem,
  CollectionMode,
  Collection,
  ITimelineItem,
} from 'mithril-materialized';
import { getInjectIcon, getIcon, executionIcon, padLeft } from '../../utils';
import { IExecutingInject } from '../../models';
import { Timeline } from 'mithril-materialized';

export const SimulationView: FactoryComponent = () => {
  const timeFormatter = (d: Date) =>
    `${padLeft(d.getUTCHours())}:${padLeft(d.getUTCMinutes())}:${padLeft(d.getUTCSeconds())}`;
  const state = {
    trial: {} as ITrial,
    injects: [] as IInject[],
    injectNames: {} as { [key: string]: string },
    scenarios: [] as IScenario[],
    scenarioId: '',
  };

  return {
    oninit: () => {
      const trial = TrialSvc.getCurrent();
      if (!trial) {
        return;
      }
      const scenarios = trial.injects.filter(i => i.type === InjectType.SCENARIO);
      if (!scenarios || scenarios.length === 0) {
        return;
      }
      const scenarioId = scenarios[0].id;
      const scenario = scenarios.filter(s => s.id === scenarioId).shift();
      if (!scenario) {
        return undefined;
      }
      const injects = pruneInjects(scenario, trial.injects) || [];
      const injectNames = injects.reduce(
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
      state.trial = trial;
      state.injects = injects;
      state.injectNames = injectNames;
      state.scenarios = scenarios;
      state.scenarioId = scenarioId;
    },
    view: () => {
      const { trial, scenarioId, scenarios, injects, injectNames } = state;
      const options = scenarios.map(s => ({ id: s.id, label: s.title }));
      const autoTransitions = injects
        .filter(i => i.condition && i.condition.type === InjectConditionType.MANUALLY)
        .map(i => ({ id: i.id, delayInMSec: 30000 }));
      const simStates = simulationEngine(trial, scenarioId, autoTransitions);
      console.table(simStates);
      if (!simStates) {
        return undefined;
      }

      const exe = injects
        .filter(i => simStates.hasOwnProperty(i.id))
        .map(
          i =>
            ({
              ...simStates[i.id],
              ...i,
            } as IExecutingInject)
        )
        .sort((a, b) => (a.lastTransitionAt > b.lastTransitionAt ? 1 : -1));

      const items = exe
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
                      className: 'yellow black-text',
                      content: injectNames[i.id],
                    } as ICollectionItem)
                ),
              }),
            } as ITimelineItem)
        );

      return [
        m(
          '.row',
          m(
            '.col.s12.l3',
            m(Select, {
              options,
              checkedId: scenarioId,
              iconName: getInjectIcon(InjectType.SCENARIO),
              onchange: (id: string) => (state.scenarioId = id),
            } as ISelectOptions<string>)
          ),
          m(
            '.col.s12.l9.sb.large',
            m(Timeline, {
              timeFormatter,
              items,
            })
          )
        ),
      ];
    },
  };
};
