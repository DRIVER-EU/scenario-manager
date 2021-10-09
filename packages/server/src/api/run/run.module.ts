import { Module } from '@nestjs/common';
import { RunController } from './run.controller';
import { RunService } from './run.service';
import { KafkaModule } from '../../adapters/kafka';
import { TrialModule } from '../trials/trial.module';
import { ExecutionModule } from '../execution/execution.module';

@Module({
  imports: [KafkaModule, TrialModule, ExecutionModule],
  controllers: [RunController],
  providers: [RunService],
})
export class RunModule {}
