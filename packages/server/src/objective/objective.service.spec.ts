import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ObjectiveService } from './objective.service';
import { Objective } from './objective.entity';

export class ObjectiveRepository extends Repository<Objective> {
  constructor() {
    super();
  }
}

describe('ObjectiveService', () => {
  let service: ObjectiveService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'ObjectiveRepository', useClass: ObjectiveRepository },
        ObjectiveService,
      ],
    }).compile();
    service = module.get<ObjectiveService>(ObjectiveService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
