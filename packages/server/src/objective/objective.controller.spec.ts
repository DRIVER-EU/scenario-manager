import { Test, TestingModule } from '@nestjs/testing';
import { ObjectiveController } from './objective.controller';
import { ObjectiveService } from './objective.service';
import { ObjectiveRepository } from './objective.service.spec';

describe('Objective Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        { provide: 'ObjectiveRepository', useClass: ObjectiveRepository },
        ObjectiveService,
      ],
      controllers: [ObjectiveController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: ObjectiveController = module.get<ObjectiveController>(ObjectiveController);
    expect(controller).toBeDefined();
  });
});
