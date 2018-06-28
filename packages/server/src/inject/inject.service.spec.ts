import { Test, TestingModule } from '@nestjs/testing';
import { InjectService } from './inject.service';

describe('InjectService', () => {
  let service: InjectService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InjectService],
    }).compile();
    service = module.get<InjectService>(InjectService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
