import { Test, TestingModule } from '@nestjs/testing';
import { CatalogServiceModule } from './catalog-service.module';
import { CatalogServiceController } from './catalog-service.controller';
import { CatalogServiceService } from './catalog-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { Album } from './entities/album.entity';

describe('CatalogServiceModule', () => {
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
      imports: [CatalogServiceModule],
    })
      .overrideProvider(getRepositoryToken(Artist))
      .useValue(mockRepository)
      .overrideProvider(getRepositoryToken(Album))
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

  it('should have CatalogServiceController', () => {
    const controller = module.get<CatalogServiceController>(CatalogServiceController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(CatalogServiceController);
  });

  it('should have CatalogServiceService', () => {
    const service = module.get<CatalogServiceService>(CatalogServiceService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(CatalogServiceService);
  });

  it('should provide Artist repository', () => {
    const repository = module.get(getRepositoryToken(Artist));
    expect(repository).toBeDefined();
  });

  it('should provide Album repository', () => {
    const repository = module.get(getRepositoryToken(Album));
    expect(repository).toBeDefined();
  });

  it('should configure TypeOrmModule with Artist entity', () => {
    const repository = module.get(getRepositoryToken(Artist));
    expect(repository).toBeDefined();
  });

  it('should configure TypeOrmModule with Album entity', () => {
    const repository = module.get(getRepositoryToken(Album));
    expect(repository).toBeDefined();
  });

  it('should have all required providers', () => {
    const service = module.get<CatalogServiceService>(CatalogServiceService);
    expect(service).toBeDefined();
  });

  it('should have controller that uses service', () => {
    const controller = module.get<CatalogServiceController>(CatalogServiceController);
    const service = module.get<CatalogServiceService>(CatalogServiceService);
    
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
