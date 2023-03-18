import { Module } from '@nestjs/common';
import { RunController } from './run.controller.js';
import { RunService } from './run.service.js';
import { KafkaModule } from '../../adapters/kafka/index.js';
import { TrialModule } from '../trials/trial.module.js';
import { ExecutionModule } from '../execution/execution.module.js';

@Module({
  imports: [KafkaModule, TrialModule, ExecutionModule],
  controllers: [RunController],
  providers: [RunService],
})
export class RunModule {}
