import { Test, TestingModule } from '@nestjs/testing';
import { UsersServiceService } from './users-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersServiceService', () => {
  let service: UsersServiceService;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: '$2b$10$hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersServiceService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersServiceService>(UsersServiceService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Reset the mock after module init
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should skip admin seeding when credentials are not in env', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service.onModuleInit();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Admin credentials not found in env, skipping seed.');
      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should seed admin user when credentials exist and admin does not exist', async () => {
      process.env.ADMIN_EMAIL = 'admin@example.com';
      process.env.ADMIN_PASSWORD = 'adminpass123';

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        email: 'admin@example.com',
        name: 'Admin',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedadminpassword');

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.onModuleInit();

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'admin@example.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('adminpass123', 10);
      expect(userRepository.save).toHaveBeenCalledWith({
        email: 'admin@example.com',
        name: 'Admin',
        password: '$2b$10$hashedadminpassword',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('Seeding admin user...');
      expect(consoleLogSpy).toHaveBeenCalledWith('Admin user seeded.');

      consoleLogSpy.mockRestore();
    });

    it('should not seed admin when admin already exists', async () => {
      process.env.ADMIN_EMAIL = 'admin@example.com';
      process.env.ADMIN_PASSWORD = 'adminpass123';

      const existingAdmin = { ...mockUser, email: 'admin@example.com', name: 'Admin' };
      mockUserRepository.findOne.mockResolvedValue(existingAdmin);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.onModuleInit();

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'admin@example.com' } });
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalledWith('Seeding admin user...');

      consoleLogSpy.mockRestore();
    });

    it('should skip seeding when only email is provided', async () => {
      process.env.ADMIN_EMAIL = 'admin@example.com';

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service.onModuleInit();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Admin credentials not found in env, skipping seed.');
      expect(userRepository.findOne).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should skip seeding when only password is provided', async () => {
      process.env.ADMIN_PASSWORD = 'adminpass123';

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service.onModuleInit();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Admin credentials not found in env, skipping seed.');
      expect(userRepository.findOne).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'plainpassword',
        name: 'New User',
      };
      const hashedPassword = '$2b$10$hashedpassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
      });

      const result = await service.create(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10);
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(result.password).toBe(hashedPassword);
      expect(result.password).not.toBe('plainpassword');
    });

    it('should create a user without password', async () => {
      const userData = {
        email: 'nopass@example.com',
        name: 'No Password User',
      };
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        email: userData.email,
        name: userData.name,
        password: null,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        email: userData.email,
        name: userData.name,
        password: null,
      });

      const result = await service.create(userData);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledWith(userData);
      expect(userRepository.save).toHaveBeenCalled();
      expect(result.email).toBe(userData.email);
    });

    it('should create user with all fields', async () => {
      const userData = {
        email: 'full@example.com',
        password: 'password123',
        name: 'Full User',
      };
      const hashedPassword = '$2b$10$newhashed';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      const createdUser = {
        ...mockUser,
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
      };
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(userData);

      expect(result.email).toBe('full@example.com');
      expect(result.name).toBe('Full User');
      expect(result.password).toBe(hashedPassword);
    });

    it('should handle bcrypt hashing errors', async () => {
      const userData = {
        email: 'error@example.com',
        password: 'password',
        name: 'Error User',
      };
      const error = new Error('Hashing failed');
      (bcrypt.hash as jest.Mock).mockRejectedValue(error);

      await expect(service.create(userData)).rejects.toThrow('Hashing failed');
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      const userData = {
        email: 'save-error@example.com',
        password: 'password',
        name: 'Save Error User',
      };
      const hashedPassword = '$2b$10$hashed';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(mockUser);
      const error = new Error('Save failed');
      mockUserRepository.save.mockRejectedValue(error);

      await expect(service.create(userData)).rejects.toThrow('Save failed');
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should handle duplicate email errors', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password',
        name: 'Duplicate User',
      };
      const hashedPassword = '$2b$10$hashed';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(mockUser);
      const error = new Error('Duplicate entry');
      mockUserRepository.save.mockRejectedValue(error);

      await expect(service.create(userData)).rejects.toThrow('Duplicate entry');
    });

    it('should hash password with 10 rounds', async () => {
      const userData = {
        email: 'rounds@example.com',
        password: 'mypassword',
        name: 'Rounds User',
      };
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashed');
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.create(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10);
    });
  });

  describe('findOne', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(email);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when user is not found', async () => {
      const email = 'notfound@example.com';
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(email);

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });

    it('should find users with different emails', async () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';
      const user1 = { ...mockUser, email: email1 };
      const user2 = { ...mockUser, email: email2, id: 2 };

      mockUserRepository.findOne.mockResolvedValueOnce(user1);
      mockUserRepository.findOne.mockResolvedValueOnce(user2);

      const result1 = await service.findOne(email1);
      const result2 = await service.findOne(email2);

      expect(result1.email).toBe(email1);
      expect(result2.email).toBe(email2);
      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should handle database errors', async () => {
      const email = 'error@example.com';
      const error = new Error('Database error');
      mockUserRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne(email)).rejects.toThrow('Database error');
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });

    it('should search with correct where clause', async () => {
      const email = 'specific@example.com';
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await service.findOne(email);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'specific@example.com' },
      });
    });

    it('should handle email with special characters', async () => {
      const email = 'user+tag@example.com';
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, email });

      const result = await service.findOne(email);

      expect(result.email).toBe(email);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });

    it('should return user with all properties', async () => {
      const email = 'full@example.com';
      const fullUser = {
        ...mockUser,
        email,
        name: 'Full Name',
        password: '$2b$10$fullhash',
      };
      mockUserRepository.findOne.mockResolvedValue(fullUser);

      const result = await service.findOne(email);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('password');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });
});
