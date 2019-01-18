import { IContent } from './content';
import { IObjective } from './objective';
import { IInjectGroup, IInject } from '.';

export interface IScenario extends IContent {
  startDate?: Date;
  endDate?: Date;
  createdDate: Date;
  updatedDate: Date;
  objectives: IObjective[];
  storylines: Array<IInject | IInjectGroup>;
}
