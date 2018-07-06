import { IScenario } from '../../models/scenario';
import { Reducer, Action } from 'redux';

const log = console.log;

/*
 * action types
 */
export const UPDATE_SCENARIO = 'UPDATED_SCENARIO';
export const DELETE_SCENARIO = 'DELETE_SCENARIO';

/*
 * action creators
 */
export interface IScenarioAction extends Action<string> {
  scenario?: IScenario;
}

export const updateScenario = (updatedScenario: IScenario) => {
  return { type: UPDATE_SCENARIO, scenario: updatedScenario } as IScenarioAction;
};

export const deleteScenario = () => {
  return { type: DELETE_SCENARIO } as IScenarioAction;
};

/**
 * Reducer functions
 *
 * Note that:
 * - the name of the reducer should equal the name of the state.
 * - the default value of the state equals its initial state.
 */

/**
 * Reducer function to update the store's scenario state.
 * @param state Current scenario
 * @param action Action that you wish to perform on the scenario
 */
export const scenario: Reducer<IScenario, IScenarioAction> = (
  state: IScenario = {} as IScenario,
  action: IScenarioAction
) => {
  switch (action.type) {
    case UPDATE_SCENARIO:
      if (action && action.scenario) {
        log('STORE: New scenario ' + action.scenario.id);
        return action.scenario;
      }
      return state;
    case DELETE_SCENARIO:
      return {} as IScenario;
    default:
      return state;
  }
};
