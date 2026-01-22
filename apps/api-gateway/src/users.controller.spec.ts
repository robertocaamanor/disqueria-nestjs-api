import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

describe('UsersController', () => {
  let controller: UsersController;
  let client: ClientProxy;

  const mockClient = {
    send: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: 'USERS_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    client = module.get<ClientProxy>('USERS_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create and return a user', () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };
      const createdUser = {
        id: 2,
        email: createUserDto.email,
        name: createUserDto.name,
      };
      mockClient.send.mockReturnValue(of(createdUser));

      const result = controller.createUser(createUserDto);

      result.subscribe((data) => {
        expect(data).toEqual(createdUser);
        expect(data).not.toHaveProperty('password');
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'create_user' }, createUserDto);
    });

    it('should create user with all required fields', () => {
      const createUserDto = {
        email: 'full@example.com',
        password: 'securepass123',
        name: 'Full User',
      };
      const createdUser = {
        id: 3,
        email: createUserDto.email,
        name: createUserDto.name,
      };
      mockClient.send.mockReturnValue(of(createdUser));

      const result = controller.createUser(createUserDto);

      result.subscribe((data) => {
        expect(data.email).toBe('full@example.com');
        expect(data.name).toBe('Full User');
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'create_user' }, createUserDto);
    });

    it('should handle user creation errors', () => {
      const createUserDto = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'Duplicate User',
      };
      const error = new Error('Email already exists');
      mockClient.send.mockReturnValue(throwError(() => error));

      const result = controller.createUser(createUserDto);

      result.subscribe({
        error: (err) => {
          expect(err.message).toBe('Email already exists');
        },
      });
    });

    it('should handle service unavailable', () => {
      const createUserDto = {
        email: 'error@example.com',
        password: 'password123',
        name: 'Error User',
      };
      const error = new Error('Service unavailable');
      mockClient.send.mockReturnValue(throwError(() => error));

      const result = controller.createUser(createUserDto);

      result.subscribe({
        error: (err) => {
          expect(err.message).toBe('Service unavailable');
        },
      });
    });

    it('should pass exact dto to service', () => {
      const createUserDto = {
        email: 'exact@example.com',
        password: 'exactpass',
        name: 'Exact User',
      };
      mockClient.send.mockReturnValue(of(mockUser));

      controller.createUser(createUserDto);

      expect(client.send).toHaveBeenCalledWith(
        { cmd: 'create_user' },
        {
          email: 'exact@example.com',
          password: 'exactpass',
          name: 'Exact User',
        }
      );
    });
  });

  describe('findUser', () => {
    it('should find and return a user by email', () => {
      const email = 'test@example.com';
      mockClient.send.mockReturnValue(of(mockUser));

      const result = controller.findUser(email);

      result.subscribe((data) => {
        expect(data).toEqual(mockUser);
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'find_user' }, email);
    });

    it('should return null when user is not found', () => {
      const email = 'notfound@example.com';
      mockClient.send.mockReturnValue(of(null));

      const result = controller.findUser(email);

      result.subscribe((data) => {
        expect(data).toBeNull();
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'find_user' }, email);
    });

    it('should handle different email formats', () => {
      const emails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.com',
      ];

      emails.forEach((email) => {
        mockClient.send.mockReturnValue(of({ ...mockUser, email }));

        const result = controller.findUser(email);

        result.subscribe((data) => {
          expect(data.email).toBe(email);
        });
        expect(client.send).toHaveBeenCalledWith({ cmd: 'find_user' }, email);
      });
    });

    it('should handle service errors', () => {
      const email = 'error@example.com';
      const error = new Error('Database error');
      mockClient.send.mockReturnValue(throwError(() => error));

      const result = controller.findUser(email);

      result.subscribe({
        error: (err) => {
          expect(err.message).toBe('Database error');
        },
      });
    });

    it('should search by exact email', () => {
      const email = 'specific@example.com';
      mockClient.send.mockReturnValue(of(mockUser));

      controller.findUser(email);

      expect(client.send).toHaveBeenCalledWith({ cmd: 'find_user' }, 'specific@example.com');
    });

    it('should return user without password', () => {
      const email = 'secure@example.com';
      const userWithoutPassword = {
        id: 5,
        email: 'secure@example.com',
        name: 'Secure User',
      };
      mockClient.send.mockReturnValue(of(userWithoutPassword));

      const result = controller.findUser(email);

      result.subscribe((data) => {
        expect(data).not.toHaveProperty('password');
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('email');
        expect(data).toHaveProperty('name');
      });
    });

    it('should handle multiple find requests', () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';
      const user1 = { ...mockUser, email: email1 };
      const user2 = { ...mockUser, id: 2, email: email2 };

      mockClient.send.mockReturnValueOnce(of(user1));
      mockClient.send.mockReturnValueOnce(of(user2));

      const result1 = controller.findUser(email1);
      const result2 = controller.findUser(email2);

      result1.subscribe((data) => {
        expect(data.email).toBe(email1);
      });
      result2.subscribe((data) => {
        expect(data.email).toBe(email2);
      });
      expect(client.send).toHaveBeenCalledTimes(2);
    });
  });
});
