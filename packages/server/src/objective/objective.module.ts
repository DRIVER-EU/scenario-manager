import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectiveController } from './objective.controller';
import { ObjectiveService } from './objective.service';
import { Objective } from './objective.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Objective])],
  controllers: [ObjectiveController],
  providers: [ObjectiveService],
})
export class ObjectiveModule {}
