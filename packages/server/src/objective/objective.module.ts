import { Objective } from './objective.entity';
import { Module } from '@nestjs/common';
import { ObjectiveController } from './objective.controller';
import { ObjectiveService } from './objective.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Objective])],
  controllers: [ObjectiveController],
  providers: [ObjectiveService],
})
export class ObjectiveModule {}
