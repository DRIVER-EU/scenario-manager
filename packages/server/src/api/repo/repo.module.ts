import { Module } from '@nestjs/common';
import { RepoController } from './repo.controller';
import { trialServiceFactory } from '../trials/trial.service.provider';

@Module({
  controllers: [RepoController],
  providers: [trialServiceFactory],
})
export class RepoModule {}
