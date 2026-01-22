import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogController } from './catalog.controller';
import { UsersController } from './users.controller';
import { OrdersController } from './orders.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have AppController', () => {
    const controller = module.get<AppController>(AppController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AppController);
  });

  it('should have CatalogController', () => {
    const controller = module.get<CatalogController>(CatalogController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(CatalogController);
  });

  it('should have UsersController', () => {
    const controller = module.get<UsersController>(UsersController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(UsersController);
  });

  it('should have OrdersController', () => {
    const controller = module.get<OrdersController>(OrdersController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(OrdersController);
  });

  it('should have AppService', () => {
    const service = module.get<AppService>(AppService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AppService);
  });

  it('should import ConfigModule', () => {
    const configModule = module.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('should import AuthModule', () => {
    const authModule = module.get(AuthModule);
    expect(authModule).toBeDefined();
  });

  it('should have CATALOG_SERVICE client', () => {
    const catalogClient = module.get('CATALOG_SERVICE');
    expect(catalogClient).toBeDefined();
  });

  it('should have USERS_SERVICE client', () => {
    const usersClient = module.get('USERS_SERVICE');
    expect(usersClient).toBeDefined();
  });

  it('should have ORDERS_SERVICE client', () => {
    const ordersClient = module.get('ORDERS_SERVICE');
    expect(ordersClient).toBeDefined();
  });

  it('should configure all controllers correctly', () => {
    const controllers = [
      AppController,
      CatalogController,
      UsersController,
      OrdersController,
    ];

    controllers.forEach((ControllerClass) => {
      const controller = module.get(ControllerClass);
      expect(controller).toBeDefined();
    });
  });

  it('should have all required providers', () => {
    const service = module.get(AppService);
    expect(service).toBeDefined();
  });
});
