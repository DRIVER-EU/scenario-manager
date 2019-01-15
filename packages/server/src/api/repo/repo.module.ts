import { Module } from '@nestjs/common';
// import { ScenarioService } from '../scenarios/scenario.service';
import { RepoController } from './repo.controller';
// import { ScenarioServiceProvider } from '../scenarios/scenario.service.provider';
// import { ScenarioModule } from '../scenarios/scenario.module';
import { scenarioServiceFactory } from '../scenarios/scenario.service.provider';

@Module({
  controllers: [RepoController],
  providers: [scenarioServiceFactory],
})
export class RepoModule {}
