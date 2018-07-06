import { Action, Reducer } from 'redux';
import { UPDATE_SCENARIO, DELETE_SCENARIO, IScenarioAction } from './scenario';
import { IDashboard } from '../../models/dashboard';

/*
 * action types
 */
export const NEW_OBJECTIVE = 'NEW_OBJECTIVE';
export const TOGGLE_DASHBOARD_VISIBILITY = 'TOGGLE_DASHBOARD_VISIBILITY';
export const SET_DASHBOARD_VISIBILITY = 'SET_DASHBOARD_VISIBILITY';

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

/**
 * Reducer functions
 *
 * Note that:
 * - the name of the reducer should equal the name of the state.
 * - the default value of the state equals its initial state.
 */

const Dashboards = {
  HOME: 'HOME',
  NEW_SCENARIO: 'NEW_SCENARIO',
  EXISTING_SCENARIO: 'EXISTING_SCENARIO',
  OBJECTIVES: 'OBJECTIVES',
};

export const dashboards: Reducer<IDashboard[], IDashboardAction | IScenarioAction> = (
  state: IDashboard[] = [
    {
      id: Dashboards.HOME,
      title: 'Home',
      route: '/home',
      visible: true,
    },
    {
      id: Dashboards.NEW_SCENARIO,
      title: 'Scenario',
      route: '/new_scenario',
      visible: false,
    },
    {
      id: Dashboards.EXISTING_SCENARIO,
      title: 'Scenario',
      route: '/scenario', // `/scenario/${ScenarioSvc.current.id}`,
      visible: false,
    },
    {
      id: Dashboards.OBJECTIVES,
      title: 'Objectives',
      route: '/objectives',
      visible: false,
    },
  ],
  action: IDashboardAction | IScenarioAction
) => {
  switch (action.type) {
    case UPDATE_SCENARIO:
      // Show all dashboards except newScenario.
      return state.map((d) => {
        d.visible = d.id !== Dashboards.NEW_SCENARIO;
        return d;
      });
    case DELETE_SCENARIO:
      // Show only home.
      return state.map((d) => {
        d.visible = d.id === Dashboards.HOME;
        return d;
      });
    case TOGGLE_DASHBOARD_VISIBILITY:
      return state.map((d) => {
        if (d.id !== (action as IDashboardAction).id) {
          return d;
        }
        return { ...d, visible: !d.visible };
      });
    case SET_DASHBOARD_VISIBILITY:
      return state.map((d) => {
        const a = (action = action as IDashboardAction);
        if (d.id !== a.id) {
          return d;
        }
        return { ...d, visible: a.visibility ? a.visibility : false };
      });
    default:
      return state;
  }
};
