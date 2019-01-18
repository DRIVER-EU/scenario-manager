import { RestService } from './rest-service';
import { ChannelNames } from '../models/channels';
import { IScenario } from '../models/scenario';
import { IObjective } from '../models';
import { uuid4 } from './../../../server/src/utils/utils';

class ScenarioService extends RestService<IScenario> {
  constructor() {
    super('scenarios', ChannelNames.SCENARIO);
  }

  public load(id?: string): Promise<IScenario> {
    return super.load(id).then(s => {
      s.startDate = s.startDate ? new Date(s.startDate) : new Date();
      s.endDate = s.endDate ? new Date(s.endDate) : new Date();
      this.current = s;
      return s;
    });
  }

  public async saveScenario(s: IScenario = this.current) {
    s.updatedDate = new Date();
    super.save(s);
  }

  public getObjectives() {
    if (!this.current) { return undefined; }
    if (!this.current.objectives) {
      this.current.objectives = [];
    }
    return this.current.objectives;
  }

  public async createObjective(objective: IObjective) {
    const objectives = this.getObjectives();
    if (objectives) {
      objective.id = uuid4();
      objectives.push(objective);
    }
    await this.saveScenario();
  }

  public async updateObjective(objective: IObjective) {
    if (this.current) {
      this.current.objectives = this.current.objectives.map(o => (o.id === objective.id ? objective : o));
    }
    await this.saveScenario();
  }

  public async deleteObjective(objective: IObjective) {
    if (this.current) {
      this.current.objectives = this.current.objectives.filter(o => o.id !== objective.id);
    }
    await this.saveScenario();
  }
}

export const ScenarioSvc = new ScenarioService();
