import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioController } from './scenario.controller';
import { ScenarioService } from './scenario.service';
import { Scenario } from './scenario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scenario])],
  controllers: [ScenarioController],
  providers: [ScenarioService],
})
export class ScenarioModule {}
