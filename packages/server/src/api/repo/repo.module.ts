import { Module } from '@nestjs/common';
import { ScenarioService } from '../scenarios/scenario.service';
import { RepoController } from './repo.controller';

@Module({
  controllers: [RepoController],
  providers: [ScenarioService],
})
export class RepoModule {}
