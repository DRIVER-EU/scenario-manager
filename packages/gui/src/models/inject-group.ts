import { IInject } from '.';

export interface IInjectGroup extends IInject  {
  mainObjectiveId?: string;
  secondaryObjectiveId?: string;
}
