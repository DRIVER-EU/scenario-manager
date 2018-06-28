import { Test, TestingModule } from '@nestjs/testing';
import { ConstraintController } from './constraint.controller';

describe('Constraint Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ConstraintController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: ConstraintController = module.get<ConstraintController>(ConstraintController);
    expect(controller).toBeDefined();
  });
});
