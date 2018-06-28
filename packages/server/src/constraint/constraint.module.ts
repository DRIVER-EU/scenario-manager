import { Module } from '@nestjs/common';
import { ConstraintController } from './constraint.controller';
import { ConstraintService } from './constraint.service';
import { Constraint } from './constraint.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Constraint])],
  controllers: [ConstraintController],
  providers: [ConstraintService],
})
export class ConstraintModule {}
