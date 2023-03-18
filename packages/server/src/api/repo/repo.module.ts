import { Module } from '@nestjs/common';
import { RepoController } from './repo.controller.js';
import { TrialModule } from '../trials/trial.module.js';

@Module({
  controllers: [RepoController],
  imports: [TrialModule],
})
export class RepoModule {}
