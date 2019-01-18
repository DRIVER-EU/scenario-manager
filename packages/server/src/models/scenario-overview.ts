import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

export interface IScenarioOverview {
  /** Refers to the filename on disk */
  id: string;
  /** Title of the scenario */
  title: string;
  /** Scenario description */
  description?: string;
  /** When the scenario was created */
  creationDate?: Date;
  /** When the scenario was edited */
  lastEdit?: Date;
  // boundingBox: number[];
}

/** Brief summary of a scenario, the information you see before downloading */
export class ScenarioOverview implements IScenarioOverview {
  constructor(scenario: IScenarioOverview) {
    this.id = scenario.id;
    this.title = scenario.title;
    this.description = scenario.description;
    this.creationDate = scenario.creationDate;
    this.lastEdit = scenario.lastEdit;
  }

  /** Refers to the filename on disk */
  id: string;
  /** Title of the scenario */
  title: string;
  /** Scenario description */
  description?: string;
  /** When the scenario was created */
  creationDate?: Date;
  /** When the scenario was edited */
  lastEdit?: Date;
  // boundingBox: number[];
}
