import { Module } from '@nestjs/common';
import { RepoController } from './repo.controller';
import { TrialModule } from '../trials/trial.module';

@Module({
  controllers: [RepoController],
  imports: [TrialModule]
})
export class RepoModule {}
