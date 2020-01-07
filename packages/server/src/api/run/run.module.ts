import { Module } from '@nestjs/common';
import { RunController } from './run.controller';
import { RunService } from './run.service';
import { KafkaModule } from '../../adapters/kafka';
import { ExecutionService } from './execution.service';
import { TrialModule } from '../trials/trial.module';

@Module({
  imports: [KafkaModule, TrialModule],
  controllers: [RunController],
  providers: [RunService, ExecutionService],
})
export class RunModule {}
