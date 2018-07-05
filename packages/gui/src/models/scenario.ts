import { IContent } from './content';

export interface IScenario extends IContent {
  startDate: number;
  endDate: number;
}
