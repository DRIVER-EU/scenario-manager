import { ApiModelProperty } from '@nestjs/swagger';
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

  /** Trial ID */
  @ApiModelProperty({ description: 'Trial ID' })
  id: string;
  /** Title of the trial */
  @ApiModelProperty({ description: 'Trial title' })
  title: string;
  /** Trial description */
  @ApiModelProperty({ description: 'Trial description' })
  description?: string;
  /** When the trial was created */
  @ApiModelProperty({ description: 'Trial creation date' })
  creationDate?: Date;
  /** When the trial was edited */
  @ApiModelProperty({ description: 'Trial last edit date' })
  lastEdit?: Date;
  // boundingBox: number[];
}
