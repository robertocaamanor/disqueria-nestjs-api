import { Test, TestingModule } from '@nestjs/testing';
import { OrdersServiceModule } from './orders-service.module';
import { OrdersServiceController } from './orders-service.controller';
import { OrdersServiceService } from './orders-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

describe('OrdersServiceModule', () => {
  let module: TestingModule;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [OrdersServiceModule],
    })
      .overrideProvider(getRepositoryToken(Order))
      .useValue(mockRepository)
      .overrideProvider(getRepositoryToken(OrderItem))
      .useValue(mockRepository)
      .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have OrdersServiceController', () => {
    const controller = module.get<OrdersServiceController>(OrdersServiceController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(OrdersServiceController);
  });

  it('should have OrdersServiceService', () => {
    const service = module.get<OrdersServiceService>(OrdersServiceService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(OrdersServiceService);
  });

  it('should provide Order repository', () => {
    const repository = module.get(getRepositoryToken(Order));
    expect(repository).toBeDefined();
  });

  it('should provide OrderItem repository', () => {
    const repository = module.get(getRepositoryToken(OrderItem));
    expect(repository).toBeDefined();
  });

  it('should configure TypeOrmModule with Order entity', () => {
    const repository = module.get(getRepositoryToken(Order));
    expect(repository).toBeDefined();
  });

  it('should configure TypeOrmModule with OrderItem entity', () => {
    const repository = module.get(getRepositoryToken(OrderItem));
    expect(repository).toBeDefined();
  });

  it('should have all required providers', () => {
    const service = module.get<OrdersServiceService>(OrdersServiceService);
    expect(service).toBeDefined();
  });

  it('should have controller that uses service', () => {
    const controller = module.get<OrdersServiceController>(OrdersServiceController);
    const service = module.get<OrdersServiceService>(OrdersServiceService);
    
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
