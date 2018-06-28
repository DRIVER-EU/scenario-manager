import { Test, TestingModule } from '@nestjs/testing';
import { InjectController } from './inject.controller';

describe('Inject Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [InjectController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: InjectController = module.get<InjectController>(InjectController);
    expect(controller).toBeDefined();
  });
});
