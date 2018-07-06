import { IScenario } from './../models/scenario';
import {
  NEW_SCENARIO,
  IScenarioAction,
  IDashboardAction,
  TOGGLE_DASHBOARD_VISIBILITY,
  SET_DASHBOARD_VISIBILITY,
  DELETE_SCENARIO,
} from './actions';
import { Reducer, Action } from 'redux';
import { IDashboard } from '../models/dashboard';

/**
 * Reducer functions
 *
 * Note that:
 * - the name of the reducer should equal the name of the state
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
    case NEW_SCENARIO:
      if (action && action.scenario) {
        // tslint:disable-next-line:no-console
        console.log('STORE: New scenario ' + action.scenario.id);
        return action.scenario;
      }
      return state;
    case DELETE_SCENARIO:
      return {} as IScenario;
    default:
      return state;
  }
};

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
    case NEW_SCENARIO:
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
        const a = action = action as IDashboardAction;
        if (d.id !== a.id) {
          return d;
        }
        return { ...d, visible: a.visibility ? a.visibility : false };
      });
    default:
      return state;
  }
};
