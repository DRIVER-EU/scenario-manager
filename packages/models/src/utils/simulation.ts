import {
  IInject,
  IInjectGroup,
  IScenario,
  InjectState,
  IInjectSimState,
  InjectType,
  InjectConditionType,
  toMsec,
  getChildren,
  IExecutionService,
  IInjectSimStates,
} from '..';

/**
 * Prune all the injects in a trial, keeping only the ones relevant for the current scenario.
 *
 * @param scenario The active scenario
 * @param allInjects All injects in the current trial
 */
export const pruneInjects = (scenario: IScenario, allInjects: IInject[]) => {
  if (!allInjects) {
    return undefined;
  }
  const children = (id: string) => allInjects.filter(i => i.parentId === id);
  const scenarioId = scenario.id;
  const storylines = children(scenarioId) as IInjectGroup[];
  const acts = storylines.reduce((acc, s) => [...acc, ...children(s.id)], [] as IInjectGroup[]);
  const injects = acts.reduce((acc, a) => [...acc, ...children(a.id)], [] as IInject[]);
  return [scenario, ...storylines, ...acts, ...injects];
};

/**
 * Create the initial state.
 *
 * @param trialTime current trial time
 * @param injects all relevant injects for the active scenario
 */
export const createInitialState = (trialTime: Date, injects: IInject[]) => {
  return injects.reduce((acc, i) => {
    acc[i.id] = {
      state: i.condition ? InjectState.ON_HOLD : InjectState.IN_PROGRESS,
      lastTransitionAt: trialTime,
      title: `${i.type}: ${i.title}`,
    } as IInjectSimState;
    return acc;
  }, {} as IInjectSimStates);
};

/**
 * Process each inject and, if all conditions are satisfied, transition it to a new state.
 *
 * @param trialTime Current trial time
 * @param states State of all injects
 * @param injects Active injects, i.e. the injects active in the current scenario
 * @param startTime Trial start time
 */
export const transitionInjects = (
  trialTime: Date,
  states: IInjectSimStates,
  injects: IInject[],
  startTime: Date
) => {
  let done = true;
  const trialTimeValue = trialTime.valueOf();
  const transitionTo = (to: InjectState) => (inject: IInject) => {
    done = false;
    const state = states[inject.id];
    state.lastTransitionAt = trialTime;
    state.state = to;
  };
  const isGroup = (i: IInject) => i.type !== InjectType.INJECT;
  const inProgress = (i: IInject) => states[i.id].state === InjectState.IN_PROGRESS;
  const childrenAreExecuted = (i: IInject) =>
    getChildren(injects, i.id).reduce((acc, cur) => acc && states[cur.id].state === InjectState.EXECUTED, true);
  const onHold = (i: IInject) => states[i.id].state === InjectState.ON_HOLD;
  const parentInProgress = (i: IInject) => i.parentId && states[i.parentId].state === InjectState.IN_PROGRESS;
  const isScheduled = (i: IInject) => states[i.id].state === InjectState.SCHEDULED;
  const passCondition = (i: IInject) => {
    if (!i.condition) {
      return true;
    }
    const { type, delay, delayUnitType, injectId, injectState } = i.condition;
    if (type === InjectConditionType.AT_TIME && startTime) {
      const time = startTime.valueOf() + toMsec(delay, delayUnitType);
      return trialTimeValue >= time;
    }
    if (injectId) {
      const { state, lastTransitionAt } = states[injectId];
      if (injectState !== state && !(injectState === InjectState.IN_PROGRESS && state === InjectState.EXECUTED)) {
        return false;
      }
      if (type === InjectConditionType.IMMEDIATELY) {
        return true;
      }
      if (type === InjectConditionType.MANUALLY) {
        console.table({ type, delay, delayUnitType, injectId, injectState });
        console.table({ state, lastTransitionAt });
        console.table(i.condition);
        return true;
      }
      if (type === InjectConditionType.DELAY) {
        const time = lastTransitionAt.valueOf() + toMsec(delay, delayUnitType);
        return trialTimeValue >= time;
      }
    }
  };

  do {
    done = true;

    // Injects that are ON_HOLD and whose parent is IN_PROGRESS, transition them to SCHEDULED.
    injects
      .filter(onHold)
      .filter(parentInProgress)
      .forEach(transitionTo(InjectState.SCHEDULED));

    // Injects that are SCHEDULED and pass all conditions, transition them to IN_PROGRESS
    injects
      .filter(isScheduled)
      .filter(passCondition)
      .forEach(transitionTo(InjectState.IN_PROGRESS));

    // Injects that are a group (scenario, storyline and act), that are still in progress,
    // and whose children are all executed, transition them too to EXECUTED.
    injects
      .filter(isGroup)
      .filter(inProgress)
      .filter(childrenAreExecuted)
      .forEach(transitionTo(InjectState.EXECUTED));
  } while (!done);
};

/**
 * Filter to only select those injects that are actionable, i.e.
 * non-group injects that are IN_PROGRESS.
 *
 * @param states State of all active injects
 */
export const actionableInjects = (states: IInjectSimStates) => (i: IInject) =>
  i.type === InjectType.INJECT && states[i.id].state === InjectState.IN_PROGRESS;

/**
 * Filter for injects that must not be triggered manually, i.e. removes the manually triggered injects.
 *
 * @param inject Current inject
 */
export const nonManualInjects = (inject: IInject) =>
  inject.condition && inject.condition.type !== InjectConditionType.MANUALLY;

/** Execute each inject that is IN_PROGRESS */
export const executeInjects = (
  trialTime: Date,
  states: IInjectSimStates,
  injects: IInject[],
  executionService?: IExecutionService
) => {
  const actionableInjectFilter = actionableInjects(states);
  const transitionToExecuted = (inject: IInject) => {
    const state = states[inject.id];
    state.lastTransitionAt = trialTime;
    state.state = InjectState.EXECUTED;
    console.log(`${new Date(trialTime).toUTCString()}: Executed ${inject.title}...`);
  };

  injects
    .filter(actionableInjectFilter)
    .filter(nonManualInjects)
    .forEach(i => {
      if (executionService) {
        executionService.execute(i);
      }
      transitionToExecuted(i);
    });
};
