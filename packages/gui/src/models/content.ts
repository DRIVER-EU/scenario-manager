import { IBaseModel } from './base-model';

export interface IContent extends IBaseModel {
  title: string;
  description?: string;
}
