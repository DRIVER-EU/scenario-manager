import { Module } from '@nestjs/common';
import { KafkaModule } from '../../adapters/kafka';
import { ExecutionService } from './execution.service';
import { TrialModule } from '../trials/trial.module';

@Module({
  imports: [KafkaModule, TrialModule],
  providers: [ExecutionService],
  exports: [ExecutionService],
})
export class ExecutionModule {}
