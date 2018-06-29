import { Test, TestingModule } from '@nestjs/testing';
import { ConstraintService } from './constraint.service';
import { Constraint, ConstraintType } from './constraint.entity';
import { MockRepository } from '../../test/mocks/mock-repository.spec';

export class ConstraintRepository extends MockRepository<Constraint> {}

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

  it('should be empty initially', async () => {
    const constraints = await service.findAll();
    expect(constraints.length).toEqual(0);
  });

  it('should create entities', async () => {
    const newConstraint = new Constraint(ConstraintType.RELATIVE_TIME);
    newConstraint.delay = 1000;
    const constraint = await service.create(newConstraint);
    const constraints = await service.findAll();
    expect(constraints.length).toEqual(1);
  });

  it('should find entities', async () => {
    const newConstraint = new Constraint(ConstraintType.RELATIVE_TIME);
    newConstraint.delay = 1000;
    await service.create(newConstraint);
    const constraints = await service.findOne('0');
    expect(constraints.delay).toEqual(1000);
  });
});
