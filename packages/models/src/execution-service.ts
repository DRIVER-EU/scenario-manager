import { ITrial, IInject } from './index.js';

export interface IExecutionService {
  init(trial: ITrial): void;
  execute(i: IInject): void;
}
