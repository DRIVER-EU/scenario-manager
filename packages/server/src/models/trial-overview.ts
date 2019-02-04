import { ITrialOverview } from 'trial-manager-models';

/** Brief summary of a scenario, the information you see before downloading */
export class TrialOverview implements ITrialOverview {
  constructor(trial: ITrialOverview) {
    this.id = trial.id;
    this.title = trial.title;
    this.description = trial.description;
    this.creationDate = trial.creationDate;
    this.lastEdit = trial.lastEdit;
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
