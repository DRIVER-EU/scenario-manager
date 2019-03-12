import {
  ITrial,
  IScenario,
  getParent,
  pruneInjects,
  createInitialState,
  transitionInjects,
  executeInjects,
  IInjectSimStates,
  InjectState,
} from 'trial-manager-models';

export const simulationEngine = (
  trial: ITrial,
  scenarioId: string,
  autoTransitions: Array<{ id: string; delayInMSec: number }> = []
) => {
  const scenario = getParent(trial.injects, scenarioId) as IScenario;
  if (!scenario) {
    return undefined;
  }

  const autoTransitionInjects = (curTime: Date, injectStates: IInjectSimStates) =>
    autoTransitions
      .filter(at => {
        const { id, delayInMSec } = at;
        const injectState = injectStates[id];
        if (!injectState || injectState.state !== InjectState.IN_PROGRESS) {
          return false;
        }
        const { lastTransitionAt } = injectState;
        const desiredAutoTransitionTime = new Date(lastTransitionAt.valueOf() + delayInMSec);
        return curTime >= desiredAutoTransitionTime;
      })
      .map(at => injectStates[at.id])
      .forEach(i => {
        i.lastTransitionAt = curTime;
        i.state = InjectState.EXECUTED;
      });

  const trialStart = scenario.startDate
    ? typeof scenario.startDate === 'string'
      ? new Date(scenario.startDate)
      : scenario.startDate
    : new Date();
  const trialEnd = scenario.endDate
    ? typeof scenario.endDate === 'string'
      ? new Date(scenario.endDate)
      : scenario.endDate
    : new Date(trialStart.valueOf() + 8 * 3600 * 1000);
  let trialTime = trialStart;
  const injects = pruneInjects(scenario, trial.injects) || [];
  const states = createInitialState(trialTime, injects);

  do {
    transitionInjects(trialTime, states, injects, trialStart);
    autoTransitionInjects(trialTime, states);
    executeInjects(trialTime, states, injects);
    trialTime = new Date(trialTime.valueOf() + 1000);
  } while (trialTime < trialEnd);

  return states;
};
