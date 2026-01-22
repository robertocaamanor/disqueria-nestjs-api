import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should generate and return an access token', async () => {
      const token = 'jwt.token.here';
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(mockUser);

      expect(result).toEqual({ access_token: token });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
    });

    it('should create correct JWT payload with email and sub', async () => {
      const token = 'generated.jwt.token';
      mockJwtService.sign.mockReturnValue(token);

      await service.login(mockUser);

      const expectedPayload = {
        email: 'test@example.com',
        sub: 1,
      };
      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
    });

    it('should handle different users', async () => {
      const user1 = { id: 1, email: 'user1@example.com', name: 'User 1' };
      const user2 = { id: 2, email: 'user2@example.com', name: 'User 2' };
      const token1 = 'token.for.user1';
      const token2 = 'token.for.user2';

      mockJwtService.sign.mockReturnValueOnce(token1);
      mockJwtService.sign.mockReturnValueOnce(token2);

      const result1 = await service.login(user1);
      const result2 = await service.login(user2);

      expect(result1.access_token).toBe(token1);
      expect(result2.access_token).toBe(token2);
      expect(jwtService.sign).toHaveBeenCalledWith({ email: 'user1@example.com', sub: 1 });
      expect(jwtService.sign).toHaveBeenCalledWith({ email: 'user2@example.com', sub: 2 });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should use user id as sub claim', async () => {
      const userWithHighId = { id: 9999, email: 'highid@example.com', name: 'High ID' };
      mockJwtService.sign.mockReturnValue('token');

      await service.login(userWithHighId);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'highid@example.com',
        sub: 9999,
      });
    });

    it('should use user email in payload', async () => {
      const userWithSpecialEmail = {
        id: 5,
        email: 'special+tag@example.com',
        name: 'Special',
      };
      mockJwtService.sign.mockReturnValue('token');

      await service.login(userWithSpecialEmail);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'special+tag@example.com',
        sub: 5,
      });
    });

    it('should handle JWT signing errors', async () => {
      const error = new Error('JWT signing failed');
      mockJwtService.sign.mockImplementation(() => {
        throw error;
      });

      await expect(service.login(mockUser)).rejects.toThrow('JWT signing failed');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should return object with access_token property', async () => {
      const token = 'any.token.value';
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(mockUser);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe(token);
      expect(Object.keys(result)).toEqual(['access_token']);
    });

    it('should work with minimal user object', async () => {
      const minimalUser = { id: 10, email: 'minimal@example.com' };
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.login(minimalUser);

      expect(result).toEqual({ access_token: 'token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'minimal@example.com',
        sub: 10,
      });
    });
  });
});
