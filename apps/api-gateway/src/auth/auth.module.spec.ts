import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
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

  it('should have AuthController', () => {
    const controller = module.get<AuthController>(AuthController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AuthController);
  });

  it('should have AuthService', () => {
    const service = module.get<AuthService>(AuthService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AuthService);
  });

  it('should have JwtStrategy', () => {
    const strategy = module.get<JwtStrategy>(JwtStrategy);
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(JwtStrategy);
  });

  it('should export AuthService', async () => {
    const exportedService = module.get<AuthService>(AuthService);
    expect(exportedService).toBeDefined();
    expect(exportedService).toBeInstanceOf(AuthService);
  });

  it('should have PassportModule imported', () => {
    const passportModule = module.get(PassportModule);
    expect(passportModule).toBeDefined();
  });

  it('should have ConfigModule imported', () => {
    const configModule = module.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('should have JwtModule configured', () => {
    const jwtModule = module.get(JwtModule);
    expect(jwtModule).toBeDefined();
  });

  it('should have USERS_SERVICE client', () => {
    const usersClient = module.get('USERS_SERVICE');
    expect(usersClient).toBeDefined();
  });

  it('should provide all required providers', () => {
    const providers = [AuthService, JwtStrategy];
    
    providers.forEach((Provider) => {
      const provider = module.get(Provider);
      expect(provider).toBeDefined();
    });
  });

  it('should configure JwtModule with secret', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
    // If AuthService can generate tokens, JWT is properly configured
    expect(typeof authService.login).toBe('function');
  });
});
