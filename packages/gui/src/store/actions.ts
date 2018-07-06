import { Action } from 'redux';
import { IScenario } from './../models/scenario';

/*
 * action types
 */
export const NEW_SCENARIO = 'NEW_SCENARIO';
export const DELETE_SCENARIO = 'DELETE_SCENARIO';
export const NEW_OBJECTIVE = 'NEW_OBJECTIVE';
export const TOGGLE_DASHBOARD_VISIBILITY = 'TOGGLE_DASHBOARD_VISIBILITY';
export const SET_DASHBOARD_VISIBILITY = 'SET_DASHBOARD_VISIBILITY';

/*
 * action creators
 */
export interface IScenarioAction extends Action<string> {
  scenario?: IScenario;
}

export const updateScenario = (scenario: IScenario) => {
  return { type: NEW_SCENARIO, scenario } as IScenarioAction;
};

export const deleteScenario = () => {
  return { type: DELETE_SCENARIO } as IScenarioAction;
};

export interface IDashboardAction extends Action<string> {
  id: string;
  visibility?: boolean;
}

export const toggleDashboardVisibility = (id: string) => {
  return { type: TOGGLE_DASHBOARD_VISIBILITY, id } as IDashboardAction;
};

export const setDashboardVisibility = (id: string, visibility: boolean) => {
  return { type: SET_DASHBOARD_VISIBILITY, id, visibility } as IDashboardAction;
};
