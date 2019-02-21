import { Injectable, Inject } from '@nestjs/common';
import {
  ITrial,
  IInject,
} from 'trial-manager-models';
import { KafkaService } from '../../adapters/kafka';

@Injectable()
export class ExecutionService {
  constructor(@Inject('KafkaService') private readonly kafkaService: KafkaService) {}

  public execute(i: IInject, trial: ITrial) {

  }
}
