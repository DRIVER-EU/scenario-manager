import { Module } from '@nestjs/common';
import { RepoController } from './repo.controller';
import { trialServiceFactory } from '../trials/trial.service.provider';
import { TrialService } from '../trials/trial.service';

@Module({
  // imports: [TrialService],
  controllers: [RepoController],
  providers: [trialServiceFactory],
})
export class RepoModule {}
