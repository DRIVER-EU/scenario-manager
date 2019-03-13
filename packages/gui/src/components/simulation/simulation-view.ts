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
import { Select, ISelectOptions, ITimelineItem } from 'mithril-materialized';
import { getInjectIcon, getIcon, padLeft } from '../../utils';
import { IExecutingInject, AppState } from '../../models';
import { Timeline } from 'mithril-materialized';

export const SimulationView: FactoryComponent = () => {
  const timeFormatter = (d: Date) =>
    `${padLeft(d.getUTCHours())}:${padLeft(d.getUTCMinutes())}:${padLeft(d.getUTCSeconds())}`;
  const state = {
    trial: {} as ITrial,
    // injects: [] as IInject[],
    // injectNames: {} as { [key: string]: string },
    scenarios: [] as IScenario[],
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
      const scenarioId = AppState.simulationView.scenarioId || scenarios[0].id;
      state.trial = trial;
      state.scenarios = scenarios;
      AppState.simulationView.scenarioId = scenarioId;
    },
    view: () => {
      const { trial, scenarios } = state;
      const { scenarioId } = AppState.simulationView;
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
      const options = scenarios.map(s => ({ id: s.id, label: s.title }));
      const autoTransitions = injects
        .filter(i => i.condition && i.condition.type === InjectConditionType.MANUALLY)
        .map(i => ({ id: i.id, delayInMSec: 30000 }));
      const simStates = simulationEngine(trial, scenarioId, autoTransitions);
      console.table(simStates);
      if (!simStates) {
        return undefined;
      }

      const items = injects
        .filter(i => i.type === InjectType.INJECT)
        .filter(i => simStates.hasOwnProperty(i.id))
        .map(
          i =>
            ({
              ...simStates[i.id],
              ...i,
            } as IExecutingInject)
        )
        .sort((a, b) => (a.lastTransitionAt > b.lastTransitionAt ? 1 : -1))
        .map(
          i =>
            ({
              datetime: new Date(i.lastTransitionAt),
              iconName: getIcon(i),
              title: `${i.title} from ${injectNames[i.id]}`,
              content: i.description,
            } as ITimelineItem)
        );

      return [
        m(
          '.row',
          m(
            '.col.s12.l3.xl2',
            m(Select, {
              options,
              checkedId: scenarioId,
              iconName: getInjectIcon(InjectType.SCENARIO),
              onchange: (id: string) => (AppState.simulationView.scenarioId = id),
            } as ISelectOptions<string>)
          ),
          m(
            '.col.s12.l9.xl10.sb.large',
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
