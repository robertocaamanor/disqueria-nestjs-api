import { Test, TestingModule } from '@nestjs/testing';
import { OrdersServiceService } from './orders-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

describe('OrdersServiceService', () => {
  let service: OrdersServiceService;
  let orderRepository: Repository<Order>;

  const mockOrderItem: OrderItem = {
    id: 1,
    albumId: 1,
    quantity: 2,
    price: 19.99,
    order: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrder: Order = {
    id: 1,
    userId: 1,
    total: 39.98,
    items: [mockOrderItem],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersServiceService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersServiceService>(OrdersServiceService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order with single item and calculate total', async () => {
      const orderData = {
        userId: 1,
        items: [
          {
            albumId: 1,
            quantity: 2,
            price: 19.99,
          },
        ],
      };
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(orderRepository.save).toHaveBeenCalledTimes(1);
      const savedOrder = mockOrderRepository.save.mock.calls[0][0];
      expect(savedOrder.userId).toBe(1);
      expect(savedOrder.items).toHaveLength(1);
      expect(savedOrder.total).toBe(39.98);
    });

    it('should create an order with multiple items and correct total', async () => {
      const orderData = {
        userId: 2,
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
          {
            albumId: 3,
            quantity: 3,
            price: 15.0,
          },
        ],
      };
      const multiItemOrder = {
        ...mockOrder,
        userId: 2,
        total: 109.97, // (2 * 19.99) + (1 * 24.99) + (3 * 15.0)
        items: orderData.items,
      };
      mockOrderRepository.save.mockResolvedValue(multiItemOrder);

      const result = await service.createOrder(orderData);

      expect(result.total).toBe(109.97);
      expect(result.items).toHaveLength(3);
      expect(orderRepository.save).toHaveBeenCalledTimes(1);
      const savedOrder = mockOrderRepository.save.mock.calls[0][0];
      expect(savedOrder.total).toBe(109.97);
    });

    it('should create order with quantity 1', async () => {
      const orderData = {
        userId: 1,
        items: [
          {
            albumId: 5,
            quantity: 1,
            price: 29.99,
          },
        ],
      };
      const singleQuantityOrder = {
        ...mockOrder,
        total: 29.99,
        items: [{ ...mockOrderItem, albumId: 5, quantity: 1, price: 29.99 }],
      };
      mockOrderRepository.save.mockResolvedValue(singleQuantityOrder);

      const result = await service.createOrder(orderData);

      expect(result.total).toBe(29.99);
      const savedOrder = mockOrderRepository.save.mock.calls[0][0];
      expect(savedOrder.items[0].quantity).toBe(1);
      expect(savedOrder.total).toBe(29.99);
    });

    it('should create order with large quantities', async () => {
      const orderData = {
        userId: 1,
        items: [
          {
            albumId: 1,
            quantity: 100,
            price: 10.0,
          },
        ],
      };
      const largeOrder = {
        ...mockOrder,
        total: 1000.0,
      };
      mockOrderRepository.save.mockResolvedValue(largeOrder);

      const result = await service.createOrder(orderData);

      expect(result.total).toBe(1000.0);
      const savedOrder = mockOrderRepository.save.mock.calls[0][0];
      expect(savedOrder.total).toBe(1000.0);
    });

    it('should correctly map order items', async () => {
      const orderData = {
        userId: 3,
        items: [
          {
            albumId: 10,
            quantity: 5,
            price: 12.5,
          },
        ],
      };
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      await service.createOrder(orderData);

      const savedOrder = mockOrderRepository.save.mock.calls[0][0];
      expect(savedOrder.items).toHaveLength(1);
      expect(savedOrder.items[0].albumId).toBe(10);
      expect(savedOrder.items[0].quantity).toBe(5);
      expect(savedOrder.items[0].price).toBe(12.5);
    });

    it('should handle decimal prices correctly', async () => {
      const orderData = {
        userId: 1,
        items: [
          {
            albumId: 1,
            quantity: 3,
            price: 19.99,
          },
        ],
      };
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      await service.createOrder(orderData);

      const savedOrder = mockOrderRepository.save.mock.calls[0][0];
      expect(savedOrder.total).toBe(59.97);
    });

    it('should handle save errors', async () => {
      const orderData = {
        userId: 1,
        items: [
          {
            albumId: 1,
            quantity: 1,
            price: 10.0,
          },
        ],
      };
      const error = new Error('Database error');
      mockOrderRepository.save.mockRejectedValue(error);

      await expect(service.createOrder(orderData)).rejects.toThrow('Database error');
      expect(orderRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should create order with zero price items', async () => {
      const orderData = {
        userId: 1,
        items: [
          {
            albumId: 1,
            quantity: 1,
            price: 0,
          },
        ],
      };
      const freeOrder = { ...mockOrder, total: 0 };
      mockOrderRepository.save.mockResolvedValue(freeOrder);

      const result = await service.createOrder(orderData);

      expect(result.total).toBe(0);
      const savedOrder = mockOrderRepository.save.mock.calls[0][0];
      expect(savedOrder.total).toBe(0);
    });
  });

  describe('findOrdersByUser', () => {
    it('should return orders for a specific user', async () => {
      const userId = 1;
      const orders = [mockOrder, { ...mockOrder, id: 2 }];
      mockOrderRepository.find.mockResolvedValue(orders);

      const result = await service.findOrdersByUser(userId);

      expect(result).toEqual(orders);
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['items'],
      });
      expect(orderRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no orders', async () => {
      const userId = 999;
      mockOrderRepository.find.mockResolvedValue([]);

      const result = await service.findOrdersByUser(userId);

      expect(result).toEqual([]);
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['items'],
      });
    });

    it('should include order items in the response', async () => {
      const userId = 1;
      const ordersWithItems = [
        {
          ...mockOrder,
          items: [mockOrderItem, { ...mockOrderItem, id: 2, albumId: 2 }],
        },
      ];
      mockOrderRepository.find.mockResolvedValue(ordersWithItems);

      const result = await service.findOrdersByUser(userId);

      expect(result[0].items).toHaveLength(2);
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['items'],
      });
    });

    it('should return multiple orders for the same user', async () => {
      const userId = 5;
      const multipleOrders = [
        { ...mockOrder, id: 1 },
        { ...mockOrder, id: 2, total: 50.0 },
        { ...mockOrder, id: 3, total: 100.0 },
      ];
      mockOrderRepository.find.mockResolvedValue(multipleOrders);

      const result = await service.findOrdersByUser(userId);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['items'],
      });
    });

    it('should handle database errors', async () => {
      const userId = 1;
      const error = new Error('Database connection failed');
      mockOrderRepository.find.mockRejectedValue(error);

      await expect(service.findOrdersByUser(userId)).rejects.toThrow('Database connection failed');
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['items'],
      });
    });

    it('should filter orders by correct userId', async () => {
      const userId1 = 1;
      const userId2 = 2;
      const user1Orders = [{ ...mockOrder, userId: 1 }];
      const user2Orders = [{ ...mockOrder, userId: 2 }];

      mockOrderRepository.find.mockResolvedValueOnce(user1Orders);
      mockOrderRepository.find.mockResolvedValueOnce(user2Orders);

      const result1 = await service.findOrdersByUser(userId1);
      const result2 = await service.findOrdersByUser(userId2);

      expect(result1[0].userId).toBe(1);
      expect(result2[0].userId).toBe(2);
      expect(orderRepository.find).toHaveBeenCalledTimes(2);
    });
  });
});
