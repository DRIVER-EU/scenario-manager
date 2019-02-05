import { Module } from '@nestjs/common';
import { trialServiceFactory } from '../trials/trial.service.provider';
import { RunController } from './run.controller';
import { RunService } from './run.service';
import { KafkaModule } from '../../adapters/kafka';

@Module({
  imports: [KafkaModule],
  controllers: [RunController],
  providers: [trialServiceFactory, RunService],
})
export class RunModule {}
