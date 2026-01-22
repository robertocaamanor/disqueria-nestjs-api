import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

describe('OrdersController', () => {
  let controller: OrdersController;
  let client: ClientProxy;

  const mockClient = {
    send: jest.fn(),
  };

  const mockOrder = {
    id: 1,
    userId: 1,
    total: 39.98,
    items: [
      {
        id: 1,
        albumId: 1,
        quantity: 2,
        price: 19.99,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: 'ORDERS_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    client = module.get<ClientProxy>('ORDERS_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create and return an order', () => {
      const createOrderDto = {
        userId: 1,
        items: [
          {
            albumId: 1,
            quantity: 2,
            price: 19.99,
          },
        ],
      };
      mockClient.send.mockReturnValue(of(mockOrder));

      const result = controller.createOrder(createOrderDto);

      result.subscribe((data) => {
        expect(data).toEqual(mockOrder);
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'create_order' }, createOrderDto);
    });

    it('should create order with multiple items', () => {
      const createOrderDto = {
        userId: 1,
        items: [
          {
            albumId: 1,
            quantity: 2,
            price: 19.99,
          },
          {
            albumId: 2,
            quantity: 1,
            price: 24.99,
          },
        ],
      };
      const multiItemOrder = {
        ...mockOrder,
        total: 64.97,
        items: createOrderDto.items,
      };
      mockClient.send.mockReturnValue(of(multiItemOrder));

      const result = controller.createOrder(createOrderDto);

      result.subscribe((data) => {
        expect(data.items).toHaveLength(2);
        expect(data.total).toBe(64.97);
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'create_order' }, createOrderDto);
    });

    it('should handle order creation errors', () => {
      const createOrderDto = {
        userId: 1,
        items: [
          {
            albumId: 1,
            quantity: 1,
            price: 10.0,
          },
        ],
      };
      const error = new Error('Creation failed');
      mockClient.send.mockReturnValue(throwError(() => error));

      const result = controller.createOrder(createOrderDto);

      result.subscribe({
        error: (err) => {
          expect(err.message).toBe('Creation failed');
        },
      });
    });

    it('should create order with single item', () => {
      const createOrderDto = {
        userId: 2,
        items: [
          {
            albumId: 5,
            quantity: 1,
            price: 15.99,
          },
        ],
      };
      const singleItemOrder = {
        ...mockOrder,
        userId: 2,
        total: 15.99,
        items: createOrderDto.items,
      };
      mockClient.send.mockReturnValue(of(singleItemOrder));

      const result = controller.createOrder(createOrderDto);

      result.subscribe((data) => {
        expect(data.items).toHaveLength(1);
        expect(data.total).toBe(15.99);
      });
    });

    it('should pass correct data to service', () => {
      const createOrderDto = {
        userId: 3,
        items: [
          {
            albumId: 10,
            quantity: 5,
            price: 12.5,
          },
        ],
      };
      mockClient.send.mockReturnValue(of(mockOrder));

      controller.createOrder(createOrderDto);

      expect(client.send).toHaveBeenCalledWith({ cmd: 'create_order' }, createOrderDto);
    });
  });

  describe('getUserOrders', () => {
    it('should return orders for a user', () => {
      const userId = 1;
      const orders = [mockOrder];
      mockClient.send.mockReturnValue(of(orders));

      const result = controller.getUserOrders(userId);

      result.subscribe((data) => {
        expect(data).toEqual(orders);
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'get_user_orders' }, 1);
    });

    it('should return multiple orders for a user', () => {
      const userId = 1;
      const orders = [
        mockOrder,
        { ...mockOrder, id: 2, total: 50.0 },
        { ...mockOrder, id: 3, total: 100.0 },
      ];
      mockClient.send.mockReturnValue(of(orders));

      const result = controller.getUserOrders(userId);

      result.subscribe((data) => {
        expect(data).toHaveLength(3);
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'get_user_orders' }, 1);
    });

    it('should return empty array when user has no orders', () => {
      const userId = 999;
      mockClient.send.mockReturnValue(of([]));

      const result = controller.getUserOrders(userId);

      result.subscribe((data) => {
        expect(data).toEqual([]);
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'get_user_orders' }, 999);
    });

    it('should handle service errors', () => {
      const userId = 1;
      const error = new Error('Service unavailable');
      mockClient.send.mockReturnValue(throwError(() => error));

      const result = controller.getUserOrders(userId);

      result.subscribe({
        error: (err) => {
          expect(err.message).toBe('Service unavailable');
        },
      });
    });

    it('should convert userId to number', () => {
      const userId = 5;
      mockClient.send.mockReturnValue(of([]));

      controller.getUserOrders(userId);

      expect(client.send).toHaveBeenCalledWith(
        { cmd: 'get_user_orders' },
        expect.any(Number)
      );
    });

    it('should handle different user IDs', () => {
      const userId1 = 1;
      const userId2 = 2;
      const orders1 = [{ ...mockOrder, userId: 1 }];
      const orders2 = [{ ...mockOrder, userId: 2 }];

      mockClient.send.mockReturnValueOnce(of(orders1));
      mockClient.send.mockReturnValueOnce(of(orders2));

      const result1 = controller.getUserOrders(userId1);
      const result2 = controller.getUserOrders(userId2);

      result1.subscribe((data) => {
        expect(data[0].userId).toBe(1);
      });
      result2.subscribe((data) => {
        expect(data[0].userId).toBe(2);
      });
      expect(client.send).toHaveBeenCalledTimes(2);
    });
  });
});
