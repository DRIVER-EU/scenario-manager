import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorylineController } from './storyline.controller';
import { StorylineService } from './storyline.service';
import { Storyline } from './storyline.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Storyline])],
  controllers: [StorylineController],
  providers: [StorylineService],
})
export class StorylineModule {}
