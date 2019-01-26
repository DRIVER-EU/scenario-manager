import { Module } from '@nestjs/common';
import { TrialController } from './trial.controller';
import { trialServiceFactory } from './trial.service.provider';

@Module({
  controllers: [TrialController],
  providers: [trialServiceFactory],
})
export class TrialModule {}
