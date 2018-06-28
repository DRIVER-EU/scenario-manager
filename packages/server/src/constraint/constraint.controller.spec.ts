import { Test, TestingModule } from '@nestjs/testing';
import { ConstraintController } from './constraint.controller';
import { ConstraintService } from './constraint.service';
import { ConstraintRepository } from './constraint.service.spec';

describe('Constraint Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ConstraintController],
      providers: [
        { provide: 'ConstraintRepository', useClass: ConstraintRepository },
        ConstraintService,
      ],
    }).compile();
  });
  it('should be defined', () => {
    const controller: ConstraintController = module.get<ConstraintController>(ConstraintController);
    expect(controller).toBeDefined();
  });
});
