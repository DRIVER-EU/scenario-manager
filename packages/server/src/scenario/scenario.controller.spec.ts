import { Test, TestingModule } from '@nestjs/testing';
import { ScenarioController } from './scenario.controller';
import { ScenarioService } from './scenario.service';
import { ScenarioRepository } from './scenario.service.spec';

describe('Scenario Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        { provide: 'ScenarioRepository', useClass: ScenarioRepository },
        ScenarioService,
      ],
      controllers: [ScenarioController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: ScenarioController = module.get<ScenarioController>(ScenarioController);
    expect(controller).toBeDefined();
  });
});
