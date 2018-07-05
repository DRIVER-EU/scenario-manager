import { EventEmitter } from './../utils/event-emitter';
import { ScenarioSvc } from '../services/scenario-service';
import { IObjective } from './objective';

export interface IPropertyChanged<T> {
  newValue: T;
}

export const AppState = {
  scenarioLoaded: false,
  dashboards: [
    {
      title: 'Home',
      route: () => '/home',
      visible: () => true,
    },
    {
      title: 'Scenario',
      route: () => ScenarioSvc.current ? `/scenario/${ScenarioSvc.current.id}` : '/scenario',
      visible: (): boolean => AppState.scenarioLoaded,
    },
    {
      title: 'Objectives',
      route: () => '/objectives',
      visible: (): boolean => AppState.scenarioLoaded,
    },
  ],
  objectives: {
    parentChanged: new EventEmitter<IPropertyChanged<IObjective>>(),
    parent: {} as IObjective,
  },
};
