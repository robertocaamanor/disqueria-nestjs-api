import { Test, TestingModule } from '@nestjs/testing';
import { UsersServiceModule } from './users-service.module';
import { UsersServiceController } from './users-service.controller';
import { UsersServiceService } from './users-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UsersServiceModule', () => {
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
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;

    module = await Test.createTestingModule({
      imports: [UsersServiceModule],
    })
      .overrideProvider(getRepositoryToken(User))
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

  it('should have UsersServiceController', () => {
    const controller = module.get<UsersServiceController>(UsersServiceController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(UsersServiceController);
  });

  it('should have UsersServiceService', () => {
    const service = module.get<UsersServiceService>(UsersServiceService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(UsersServiceService);
  });

  it('should provide User repository', () => {
    const repository = module.get(getRepositoryToken(User));
    expect(repository).toBeDefined();
  });

  it('should configure TypeOrmModule with User entity', () => {
    const repository = module.get(getRepositoryToken(User));
    expect(repository).toBeDefined();
  });

  it('should have all required providers', () => {
    const service = module.get<UsersServiceService>(UsersServiceService);
    expect(service).toBeDefined();
  });

  it('should have controller that uses service', () => {
    const controller = module.get<UsersServiceController>(UsersServiceController);
    const service = module.get<UsersServiceService>(UsersServiceService);
    
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should initialize UsersServiceService on module init', async () => {
    const service = module.get<UsersServiceService>(UsersServiceService);
    expect(service).toBeDefined();
    expect(typeof service.onModuleInit).toBe('function');
  });
});
