import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScenarioModule } from './api/scenarios/scenario.module';
import { RepoModule } from './api/repo/repo.module';

@Module({
  imports: [ScenarioModule, RepoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
