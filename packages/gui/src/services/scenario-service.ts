import { RestService } from './rest-service';
import { IScenario } from '../models/scenario';
import { ChannelNames } from '../models/channels';

class ScenarioService extends RestService<IScenario> {
  constructor() {
    super('scenario', ChannelNames.SCENARIO);
  }
}

export const ScenarioSvc = new ScenarioService();
