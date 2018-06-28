import { Module } from '@nestjs/common';
import { StorylineController } from './storyline.controller';
import { StorylineService } from './storyline.service';
import { Storyline } from './storyline.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Storyline])],
  controllers: [StorylineController],
  providers: [StorylineService],
})
export class StorylineModule {}
