import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectController } from './inject.controller';
import { InjectService } from './inject.service';
import { Inject } from './inject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inject])],
  controllers: [InjectController],
  providers: [InjectService],
})
export class InjectModule {}
