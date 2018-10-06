import { RestService } from './rest-service';
import { IScenario } from '../models/scenario';
import { ChannelNames } from '../models/channels';

class ScenarioService extends RestService<IScenario> {
  constructor() {
    super('scenario', ChannelNames.SCENARIO);
  }

  public load(id: string): Promise<IScenario> {
    return super.load(id)
      .then(s => {
        s.startDate = new Date(s.startDate);
        s.endDate = new Date(s.endDate);
        this.current = s;
        return s;
      });
  }
}

export const ScenarioSvc = new ScenarioService();
