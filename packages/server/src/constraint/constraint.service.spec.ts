import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ConstraintService } from './constraint.service';
import { Constraint } from './constraint.entity';

export class ConstraintRepository extends Repository<Constraint> {
  constructor() {
    super();
    console.log('Constructed');
  }
}

describe('ConstraintService', () => {
  let service: ConstraintService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'ConstraintRepository', useClass: ConstraintRepository },
        ConstraintService,
      ],
    }).compile();
    service = module.get<ConstraintService>(ConstraintService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
