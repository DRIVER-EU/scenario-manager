import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ScenarioService } from './scenario.service';
import { Scenario } from './scenario.entity';

export class ScenarioRepository extends Repository<Scenario> {
  constructor() {
    super();
  }
}

describe('ScenarioService', () => {
  let service: ScenarioService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'ScenarioRepository', useClass: ScenarioRepository },
        ScenarioService,
      ],
    }).compile();
    service = module.get<ScenarioService>(ScenarioService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
