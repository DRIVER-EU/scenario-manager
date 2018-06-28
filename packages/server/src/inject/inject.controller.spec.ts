import { Test, TestingModule } from '@nestjs/testing';
import { InjectController } from './inject.controller';
import { InjectRepository } from './inject.service.spec';
import { InjectService } from './inject.service';

describe('Inject Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        { provide: 'InjectRepository', useClass: InjectRepository },
        InjectService,
      ],
      controllers: [InjectController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: InjectController = module.get<InjectController>(InjectController);
    expect(controller).toBeDefined();
  });
});
