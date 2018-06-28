import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { StorylineService } from './storyline.service';
import { Storyline } from './storyline.entity';

export class StorylineRepository extends Repository<Storyline> {
  constructor() {
    super();
  }
}

describe('StorylineService', () => {
  let service: StorylineService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'StorylineRepository', useClass: StorylineRepository },
        StorylineService,
      ],
    }).compile();
    service = module.get<StorylineService>(StorylineService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
