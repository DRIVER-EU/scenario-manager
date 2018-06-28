import { Test, TestingModule } from '@nestjs/testing';
import { StorylineController } from './storyline.controller';

describe('Storyline Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StorylineController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: StorylineController = module.get<StorylineController>(StorylineController);
    expect(controller).toBeDefined();
  });
});
