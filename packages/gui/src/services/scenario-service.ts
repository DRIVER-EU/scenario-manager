import { RestService } from './rest-service';
import { IScenario } from '../models/scenario';

class ScenarioService extends RestService<IScenario> {
  constructor() {
    super('http://localhost:3000/scenario/');
  }
}

export const ScenarioSvc = new ScenarioService();
