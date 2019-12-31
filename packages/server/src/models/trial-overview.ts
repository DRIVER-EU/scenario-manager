import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'Trial ID' })
  id: string;
  /** Title of the trial */
  @ApiProperty({ description: 'Trial title' })
  title: string;
  /** Trial description */
  @ApiProperty({ description: 'Trial description' })
  description?: string;
  /** When the trial was created */
  @ApiProperty({ description: 'Trial creation date' })
  creationDate?: Date;
  /** When the trial was edited */
  @ApiProperty({ description: 'Trial last edit date' })
  lastEdit?: Date;
  // boundingBox: number[];
}
