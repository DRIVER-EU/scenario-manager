import { Module } from '@nestjs/common';
import { ScenarioController } from './scenario.controller';
// import { ScenarioService } from './scenario.service';
import { scenarioServiceFactory } from './scenario.service.provider';

@Module({
  controllers: [ScenarioController],
  providers: [scenarioServiceFactory],
})
export class ScenarioModule {}
