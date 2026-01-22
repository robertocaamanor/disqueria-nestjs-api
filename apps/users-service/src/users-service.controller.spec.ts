import { Test, TestingModule } from '@nestjs/testing';
import { UsersServiceController } from './users-service.controller';
import { UsersServiceService } from './users-service.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersServiceController', () => {
  let controller: UsersServiceController;
  let service: UsersServiceService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: '$2b$10$hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersServiceController],
      providers: [
        {
          provide: UsersServiceService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersServiceController>(UsersServiceController);
    service = module.get<UsersServiceService>(UsersServiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };
      const createdUser = { ...mockUser, id: 2, email: createUserDto.email, name: createUserDto.name };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.createUser(createUserDto);

      expect(result).toEqual(createdUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should create a user with minimum required fields', async () => {
      const createUserDto = {
        email: 'minimal@example.com',
        password: 'pass123',
        name: 'Min',
      };
      const createdUser = { ...mockUser, email: createUserDto.email, name: createUserDto.name };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.createUser(createUserDto);

      expect(result).toEqual(createdUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should hash password when creating user', async () => {
      const createUserDto = {
        email: 'secure@example.com',
        password: 'plainpassword',
        name: 'Secure User',
      };
      const hashedPassword = '$2b$10$newhashedpassword';
      const createdUser = { ...mockUser, email: createUserDto.email, password: hashedPassword };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.createUser(createUserDto);

      expect(result.password).not.toBe('plainpassword');
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle errors when creating a user with duplicate email', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Duplicate User',
      };
      const error = new Error('Email already exists');
      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.createUser(createUserDto)).rejects.toThrow('Email already exists');
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle general database errors', async () => {
      const createUserDto = {
        email: 'error@example.com',
        password: 'password123',
        name: 'Error User',
      };
      const error = new Error('Database connection failed');
      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.createUser(createUserDto)).rejects.toThrow('Database connection failed');
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findUser', () => {
    it('should find and return a user without password', async () => {
      const email = 'test@example.com';
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findUser(email);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(email);
      expect(service.findOne).toHaveBeenCalledWith(email);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when user is not found', async () => {
      const email = 'nonexistent@example.com';
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await controller.findUser(email);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(email);
    });

    it('should exclude password field from response', async () => {
      const email = 'test@example.com';
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findUser(email);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).not.toHaveProperty('password');
    });

    it('should handle different email formats', async () => {
      const emails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.com',
      ];

      for (const email of emails) {
        mockUsersService.findOne.mockResolvedValue({ ...mockUser, email });
        const result = await controller.findUser(email);
        expect(result.email).toBe(email);
        expect(service.findOne).toHaveBeenCalledWith(email);
      }
    });

    it('should handle errors when finding a user', async () => {
      const email = 'test@example.com';
      const error = new Error('Database error');
      mockUsersService.findOne.mockRejectedValue(error);

      await expect(controller.findUser(email)).rejects.toThrow('Database error');
      expect(service.findOne).toHaveBeenCalledWith(email);
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await controller.validateUser(loginDto);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(loginDto.email);
      expect(service.findOne).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should return null with incorrect password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await controller.validateUser(loginDto);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should return null when user does not exist', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await controller.validateUser(loginDto);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should exclude password from validated user response', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await controller.validateUser(loginDto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).not.toHaveProperty('password');
    });

    it('should handle multiple failed validation attempts', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result1 = await controller.validateUser(loginDto);
      const result2 = await controller.validateUser(loginDto);
      const result3 = await controller.validateUser(loginDto);

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
      expect(service.findOne).toHaveBeenCalledTimes(3);
      expect(bcrypt.compare).toHaveBeenCalledTimes(3);
    });

    it('should validate different users correctly', async () => {
      const user1 = { ...mockUser, id: 1, email: 'user1@example.com' };
      const user2 = { ...mockUser, id: 2, email: 'user2@example.com' };

      mockUsersService.findOne.mockResolvedValueOnce(user1);
      mockUsersService.findOne.mockResolvedValueOnce(user2);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result1 = await controller.validateUser({
        email: 'user1@example.com',
        password: 'pass1',
      });
      const result2 = await controller.validateUser({
        email: 'user2@example.com',
        password: 'pass2',
      });

      expect(result1.email).toBe('user1@example.com');
      expect(result2.email).toBe('user2@example.com');
    });

    it('should handle errors during validation', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const error = new Error('Database error');
      mockUsersService.findOne.mockRejectedValue(error);

      await expect(controller.validateUser(loginDto)).rejects.toThrow('Database error');
      expect(service.findOne).toHaveBeenCalledWith(loginDto.email);
    });

    it('should handle bcrypt comparison errors', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

      await expect(controller.validateUser(loginDto)).rejects.toThrow('Bcrypt error');
      expect(service.findOne).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });
  });
});
