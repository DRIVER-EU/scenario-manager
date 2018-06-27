import { Test, TestingModule } from '@nestjs/testing';
import { ScenarioController } from './scenario.controller';

describe('Scenario Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ScenarioController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: ScenarioController = module.get<ScenarioController>(ScenarioController);
    expect(controller).toBeDefined();
  });
});
