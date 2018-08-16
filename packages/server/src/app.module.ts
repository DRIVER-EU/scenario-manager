import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScenarioModule } from './scenario/scenario.module';
import { ObjectiveModule } from './objective/objective.module';
import { InjectModule } from './inject/inject.module';
import { ConstraintModule } from './constraint/constraint.module';

@Module({
  imports: [TypeOrmModule.forRoot(), ScenarioModule, ObjectiveModule, InjectModule, ConstraintModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
