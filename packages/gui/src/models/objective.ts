import { IContent } from './content';

export interface IObjective extends IContent {
  parentId: string;
  scenarioId: string;
}
