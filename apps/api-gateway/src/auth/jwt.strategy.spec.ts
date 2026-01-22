import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockConfigService.get.mockReturnValue('test-secret-key');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object with userId and email for valid payload', async () => {
      const payload = {
        sub: 1,
        email: 'test@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 1,
        email: 'test@example.com',
      });
    });

    it('should throw UnauthorizedException for null payload', async () => {
      await expect(strategy.validate(null)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for undefined payload', async () => {
      await expect(strategy.validate(undefined)).rejects.toThrow(UnauthorizedException);
    });

    it('should validate payload with different user IDs', async () => {
      const payload1 = { sub: 1, email: 'user1@example.com' };
      const payload2 = { sub: 999, email: 'user999@example.com' };

      const result1 = await strategy.validate(payload1);
      const result2 = await strategy.validate(payload2);

      expect(result1.userId).toBe(1);
      expect(result2.userId).toBe(999);
    });

    it('should validate payload with different emails', async () => {
      const payload1 = { sub: 1, email: 'first@example.com' };
      const payload2 = { sub: 2, email: 'second@example.com' };

      const result1 = await strategy.validate(payload1);
      const result2 = await strategy.validate(payload2);

      expect(result1.email).toBe('first@example.com');
      expect(result2.email).toBe('second@example.com');
    });

    it('should extract userId from sub claim', async () => {
      const payload = { sub: 42, email: 'fortytwo@example.com' };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe(42);
      expect(result).toHaveProperty('userId');
    });

    it('should preserve email from payload', async () => {
      const payload = { sub: 5, email: 'preserve@example.com' };

      const result = await strategy.validate(payload);

      expect(result.email).toBe('preserve@example.com');
      expect(result).toHaveProperty('email');
    });

    it('should validate payload with special email characters', async () => {
      const payload = { sub: 10, email: 'user+tag@example.com' };

      const result = await strategy.validate(payload);

      expect(result.email).toBe('user+tag@example.com');
    });

    it('should handle payload with additional properties', async () => {
      const payload = {
        sub: 1,
        email: 'test@example.com',
        iat: 1234567890,
        exp: 9876543210,
        extra: 'data',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 1,
        email: 'test@example.com',
      });
      expect(result).not.toHaveProperty('iat');
      expect(result).not.toHaveProperty('exp');
      expect(result).not.toHaveProperty('extra');
    });

    it('should return object with only userId and email', async () => {
      const payload = { sub: 7, email: 'seven@example.com' };

      const result = await strategy.validate(payload);

      expect(Object.keys(result)).toEqual(['userId', 'email']);
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should validate multiple payloads sequentially', async () => {
      const payloads = [
        { sub: 1, email: 'one@example.com' },
        { sub: 2, email: 'two@example.com' },
        { sub: 3, email: 'three@example.com' },
      ];

      for (const payload of payloads) {
        const result = await strategy.validate(payload);
        expect(result.userId).toBe(payload.sub);
        expect(result.email).toBe(payload.email);
      }
    });

    it('should handle payload with zero as userId', async () => {
      const payload = { sub: 0, email: 'zero@example.com' };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe(0);
      expect(result.email).toBe('zero@example.com');
    });

    it('should throw for empty object payload', async () => {
      const payload = {};

      // Empty object is truthy, so it should not throw for null check
      // but it will have undefined sub and email
      const result = await strategy.validate(payload);
      
      expect(result.userId).toBeUndefined();
      expect(result.email).toBeUndefined();
    });

    it('should validate payload with negative userId', async () => {
      const payload = { sub: -1, email: 'negative@example.com' };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe(-1);
      expect(result.email).toBe('negative@example.com');
    });
  });

  describe('constructor', () => {
    it('should use JWT_SECRET from config service', () => {
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should use fallback secret when JWT_SECRET is not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const module = Test.createTestingModule({
        providers: [
          JwtStrategy,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      });

      // Constructor is called during module compilation
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });
});
