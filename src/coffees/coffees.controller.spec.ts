import { Test, TestingModule } from '@nestjs/testing';
import { CoffeesController } from './coffees.controller';

//coffees路由控制器的单元测试
describe('CoffeesController', () => {
  let controller: CoffeesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoffeesController],
    }).compile();

    controller = module.get<CoffeesController>(CoffeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
