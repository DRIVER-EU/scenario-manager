import { Module } from '@nestjs/common';
import { KafkaModule } from '../../adapters/kafka/index.js';
import { ExecutionService } from './execution.service.js';
import { TrialModule } from '../trials/trial.module.js';

@Module({
  imports: [KafkaModule, TrialModule],
  providers: [ExecutionService],
  exports: [ExecutionService],
})
export class ExecutionModule {}
