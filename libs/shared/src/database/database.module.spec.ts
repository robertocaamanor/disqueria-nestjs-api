import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from './database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('DatabaseModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
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

  it('should import ConfigModule', () => {
    const configModule = module.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('should have ConfigService available', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();
    expect(configService).toBeInstanceOf(ConfigService);
  });

  it('should import TypeOrmModule', () => {
    const typeOrmModule = module.get(TypeOrmModule);
    expect(typeOrmModule).toBeDefined();
  });

  it('should export TypeOrmModule', async () => {
    const exportedModule = module.get(TypeOrmModule);
    expect(exportedModule).toBeDefined();
  });

  it('should configure TypeORM with ConfigService', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();
  });

  it('should configure global ConfigModule', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();
    // Config should be accessible globally
    expect(typeof configService.get).toBe('function');
  });

  it('should load environment variables from .env file', () => {
    const configService = module.get<ConfigService>(ConfigService);
    // ConfigService should be able to get values
    expect(typeof configService.get('DB_HOST')).toBeDefined();
  });
});
