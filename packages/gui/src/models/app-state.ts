import { Scenario } from './scenario';
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
      route: () => Scenario.current ? `/scenario/${Scenario.current.id}` : '/scenario',
      visible: (): boolean => AppState.scenarioLoaded,
    },
    {
      title: 'Objectives',
      route: () => '/objectives',
      visible: (): boolean => AppState.scenarioLoaded,
    },
  ],
};
