import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScenarioController } from './api/scenarios/scenario.controller';

@Module({
  controllers: [AppController, ScenarioController],
  providers: [AppService],
})
export class AppModule {}
