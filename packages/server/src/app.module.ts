import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScenarioModule } from './scenario/scenario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectiveModule } from './objective/objective.module';
import { StorylineModule } from './storyline/storyline.module';
import { InjectModule } from './inject/inject.module';

@Module({
  imports: [TypeOrmModule.forRoot(), ScenarioModule, ObjectiveModule, StorylineModule, InjectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
