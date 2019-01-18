import { IContent, IStakeholder } from '.';

export interface IObjective extends IContent {
  stakeholder?: IStakeholder[];
}
