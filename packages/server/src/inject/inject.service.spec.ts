import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { InjectService } from './inject.service';
import { Inject } from './inject.entity';

export class InjectRepository extends Repository<Inject> {
  constructor() {
    super();
  }
}

describe('InjectService', () => {
  let service: InjectService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'InjectRepository', useClass: InjectRepository },
        InjectService,
      ],
    }).compile();
    service = module.get<InjectService>(InjectService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
