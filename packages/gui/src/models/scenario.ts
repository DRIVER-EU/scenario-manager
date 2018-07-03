import { BaseModel } from './base-model';

export interface IScenario {
  id: string;
  title: string;
  description?: string;
  startDate: number;
  endDate: number;
}

class ScenarioModel extends BaseModel<IScenario> {
  constructor() {
    super('http://localhost:3000/scenario/');
  }
}

export const Scenario = new ScenarioModel();
