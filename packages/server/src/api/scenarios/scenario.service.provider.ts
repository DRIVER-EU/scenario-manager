import { ScenarioService } from './scenario.service';

const scenarioService = () => {
  const ss = new ScenarioService();
  return {
    provide: 'ScenarioService',
    useFactory: () => {
      return ss;
    },
  };
};
export const scenarioServiceFactory = scenarioService();
