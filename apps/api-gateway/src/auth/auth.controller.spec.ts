import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientProxy } from '@nestjs/microservices';
import { UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersClient: ClientProxy;

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockUsersClient = {
    send: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: 'USERS_SERVICE',
          useValue: mockUsersClient,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersClient = module.get<ClientProxy>('USERS_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const token = { access_token: 'jwt.token.here' };

      mockUsersClient.send.mockReturnValue(of(mockUser));
      mockAuthService.login.mockResolvedValue(token);

      const result = await controller.login(loginDto);

      expect(result).toEqual(token);
      expect(usersClient.send).toHaveBeenCalledWith({ cmd: 'validate_user' }, loginDto);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUsersClient.send.mockReturnValue(of(null));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(loginDto)).rejects.toThrow('Invalid credentials');
      expect(usersClient.send).toHaveBeenCalledWith({ cmd: 'validate_user' }, loginDto);
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUsersClient.send.mockReturnValue(of(null));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersClient.send).toHaveBeenCalledWith({ cmd: 'validate_user' }, loginDto);
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should handle user service errors', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const error = new Error('User service unavailable');

      mockUsersClient.send.mockReturnValue(throwError(() => error));

      await expect(controller.login(loginDto)).rejects.toThrow('User service unavailable');
      expect(usersClient.send).toHaveBeenCalledWith({ cmd: 'validate_user' }, loginDto);
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should validate different users', async () => {
      const loginDto1 = {
        email: 'user1@example.com',
        password: 'pass1',
      };
      const loginDto2 = {
        email: 'user2@example.com',
        password: 'pass2',
      };
      const user1 = { ...mockUser, email: 'user1@example.com' };
      const user2 = { ...mockUser, id: 2, email: 'user2@example.com' };
      const token1 = { access_token: 'token1' };
      const token2 = { access_token: 'token2' };

      mockUsersClient.send.mockReturnValueOnce(of(user1));
      mockUsersClient.send.mockReturnValueOnce(of(user2));
      mockAuthService.login.mockResolvedValueOnce(token1);
      mockAuthService.login.mockResolvedValueOnce(token2);

      const result1 = await controller.login(loginDto1);
      const result2 = await controller.login(loginDto2);

      expect(result1).toEqual(token1);
      expect(result2).toEqual(token2);
      expect(usersClient.send).toHaveBeenCalledTimes(2);
      expect(authService.login).toHaveBeenCalledTimes(2);
    });

    it('should handle auth service errors after validation', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const error = new Error('Token generation failed');

      mockUsersClient.send.mockReturnValue(of(mockUser));
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow('Token generation failed');
      expect(usersClient.send).toHaveBeenCalledWith({ cmd: 'validate_user' }, loginDto);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should pass exact login dto to user service', async () => {
      const loginDto = {
        email: 'exact@example.com',
        password: 'exactpass',
      };

      mockUsersClient.send.mockReturnValue(of(mockUser));
      mockAuthService.login.mockResolvedValue({ access_token: 'token' });

      await controller.login(loginDto);

      expect(usersClient.send).toHaveBeenCalledWith(
        { cmd: 'validate_user' },
        {
          email: 'exact@example.com',
          password: 'exactpass',
        }
      );
    });

    it('should handle empty user response as invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersClient.send.mockReturnValue(of(undefined));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});
