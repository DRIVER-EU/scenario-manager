import { ITrial, IInject } from '.';

export interface IExecutionService {
  init(trial: ITrial): void;
  execute(i: IInject): void;
}
