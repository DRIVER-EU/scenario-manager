import { Test, TestingModule } from '@nestjs/testing';
import { StorylineController } from './storyline.controller';
import { StorylineService } from './storyline.service';
import { StorylineRepository } from './storyline.service.spec';

describe('Storyline Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        { provide: 'StorylineRepository', useClass: StorylineRepository },
        StorylineService,
      ],
      controllers: [StorylineController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: StorylineController = module.get<StorylineController>(StorylineController);
    expect(controller).toBeDefined();
  });
});
