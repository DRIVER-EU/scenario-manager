import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScenarioModule } from './scenario/scenario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectiveModule } from './objective/objective.module';

@Module({
  imports: [TypeOrmModule.forRoot(), ScenarioModule, ObjectiveModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
