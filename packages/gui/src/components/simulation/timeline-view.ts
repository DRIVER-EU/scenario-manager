import m, { FactoryComponent } from 'mithril';
import {
  ITrial,
  IScenario,
  InjectType,
  pruneInjects,
  InjectConditionType,
  getAncestors,
  IInjectSimStates,
} from 'trial-manager-models';
import { TrialSvc } from '../../services';
import { simulationEngine } from './simulation-engine';
import { Select, ISelectOptions, ITimelineItem } from 'mithril-materialized';
import { getInjectIcon, getIcon, padLeft } from '../../utils';
import { IExecutingInject, AppState, executingChannel, TopicNames } from '../../models';
import { Timeline } from 'mithril-materialized';

export const TimelineView: FactoryComponent = () => {
  const timeFormatter = (d: Date) =>
    `${padLeft(d.getUTCHours())}:${padLeft(d.getUTCMinutes())}:${padLeft(d.getUTCSeconds())}`;
  const state = {
    simStates: undefined as IInjectSimStates | undefined,
    selectedId: undefined as string | undefined,
    trial: {} as ITrial,
    // injects: [] as IInject[],
    injectNames: {} as { [key: string]: string },
    scenarios: [] as IScenario[],
  };

  return {
    oninit: () => {
      const trial = TrialSvc.getCurrent();
      if (!trial) {
        return;
      }
      const injectNames = trial.injects.reduce(
        (acc, cur) => {
          const ancestors = getAncestors(trial.injects, cur);
          ancestors.pop(); // Remove scenario
          acc[cur.id] = ancestors
            .reverse()
            .map(i => i.title)
            .join(' > ');
          return acc;
        },
        {} as { [key: string]: string }
      );
      const scenarios = trial.injects.filter(i => i.type === InjectType.SCENARIO);
      if (!scenarios || scenarios.length === 0) {
        return;
      }
      const scenarioId = AppState.simulationView.scenarioId || scenarios[0].id;
      state.trial = trial;
      state.injectNames = injectNames;
      state.scenarios = scenarios;
      AppState.simulationView.scenarioId = scenarioId;
    },
    view: () => {
      const { trial, scenarios, injectNames, selectedId } = state;
      const { scenarioId } = AppState.simulationView;
      const scenario = scenarios.filter(s => s.id === scenarioId).shift();
      if (!scenario) {
        return undefined;
      }
      const onSelect = (ti: ITimelineItem) => {
        const { id } = ti;
        state.selectedId = id;
        const inject = executingInjects.filter(i => i.id === id).shift() as IExecutingInject;
        if (inject) {
          console.table(inject);
          executingChannel.publish(TopicNames.ITEM_SELECT, { cur: inject });
        }
      };
      const injects = pruneInjects(scenario, trial.injects) || [];
      const options = scenarios.map(s => ({ id: s.id, label: s.title }));
      const autoTransitions = injects
        .filter(i => i.condition && i.condition.type === InjectConditionType.MANUALLY)
        .map(i => ({ id: i.id, delayInMSec: 30000 }));
      const simStates = state.simStates || simulationEngine(trial, scenarioId, autoTransitions);
      if (typeof simStates === 'undefined') {
        return;
      }
      state.simStates = simStates;
      console.table(simStates);
      if (!simStates) {
        return undefined;
      }

      const executingInjects = injects
        .filter(i => i.type === InjectType.INJECT)
        .filter(i => simStates.hasOwnProperty(i.id))
        .map(
          i =>
            ({
              ...simStates[i.id],
              ...i,
            } as IExecutingInject)
        );
      const items = executingInjects
        .sort((a, b) => (a.lastTransitionAt > b.lastTransitionAt ? 1 : -1))
        .map(
          i =>
            ({
              id: i.id,
              active: selectedId === i.id,
              datetime: new Date(i.lastTransitionAt),
              iconName: getIcon(i),
              title: `${i.title}`,
              content: m('i', `From ${injectNames[i.id]}`),
            } as ITimelineItem)
        );

      return [
        m(
          '.row',
          m(
            '.col.s12',
            m(Select, {
              options,
              checkedId: scenarioId,
              iconName: getInjectIcon(InjectType.SCENARIO),
              onchange: (id: string) => {
                AppState.simulationView.scenarioId = id;
                state.simStates = undefined;
              },
            } as ISelectOptions<string>)
          ),
          m(
            '.col.s12',
            m(Timeline, {
              onSelect,
              timeFormatter,
              items,
            })
          )
        ),
      ];
    },
  };
};
