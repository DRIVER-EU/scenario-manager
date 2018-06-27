import { Module } from '@nestjs/common';
import { ScenarioController } from './scenario.controller';
import { ScenarioService } from './scenario.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scenario } from './scenario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scenario])],
  controllers: [ScenarioController],
  providers: [ScenarioService],
})
export class ScenarioModule {}
