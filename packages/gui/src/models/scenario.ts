import { IContent } from './content';

export interface IScenario extends IContent {
  // Start date as string
  startDate: Date;
  // End date as string
  endDate: Date;
  version: number;
  updatedDate: Date;
}
