import { Module } from '@nestjs/common';
import { TrialController } from './trial.controller';
import { TrialService } from './trial.service';

@Module({
  controllers: [TrialController],
  exports: [TrialService],
  providers: [TrialService],
})
export class TrialModule {}
