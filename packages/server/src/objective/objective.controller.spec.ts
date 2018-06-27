import { Test, TestingModule } from '@nestjs/testing';
import { ObjectiveController } from './objective.controller';

describe('Objective Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ObjectiveController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: ObjectiveController = module.get<ObjectiveController>(ObjectiveController);
    expect(controller).toBeDefined();
  });
});
