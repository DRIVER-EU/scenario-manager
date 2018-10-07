import { Scenario } from './../../../server/src/scenario/scenario.entity';
import { RestService } from './rest-service';
import { ChannelNames } from '../models/channels';

class ScenarioService extends RestService<Scenario> {
  constructor() {
    super('scenario', ChannelNames.SCENARIO);
  }

  public load(id: string): Promise<Scenario> {
    return super.load(id)
      .then(s => {
        s.startDate = s.startDate ? new Date(s.startDate) : new Date();
        s.endDate = s.endDate ? new Date(s.endDate) : new Date();
        this.current = s;
        return s;
      });
  }
}

export const ScenarioSvc = new ScenarioService();
