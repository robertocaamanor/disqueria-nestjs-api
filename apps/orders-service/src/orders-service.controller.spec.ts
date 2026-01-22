import { Test, TestingModule } from '@nestjs/testing';
import { OrdersServiceController } from './orders-service.controller';
import { OrdersServiceService } from './orders-service.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

describe('OrdersServiceController', () => {
  let controller: OrdersServiceController;
  let service: OrdersServiceService;

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

  const mockOrdersService = {
    createOrder: jest.fn(),
    findOrdersByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersServiceController],
      providers: [
        {
          provide: OrdersServiceService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersServiceController>(OrdersServiceController);
    service = module.get<OrdersServiceService>(OrdersServiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create and return an order with single item', async () => {
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
      mockOrdersService.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
      expect(service.createOrder).toHaveBeenCalledTimes(1);
    });

    it('should create an order with multiple items', async () => {
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
      const orderWithMultipleItems: Order = {
        ...mockOrder,
        total: 64.97,
        items: [
          mockOrderItem,
          { ...mockOrderItem, id: 2, albumId: 2, quantity: 1, price: 24.99 },
        ],
      };
      mockOrdersService.createOrder.mockResolvedValue(orderWithMultipleItems);

      const result = await controller.createOrder(createOrderDto);

      expect(result).toEqual(orderWithMultipleItems);
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(64.97);
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
    });

    it('should create an order with quantity 1', async () => {
      const createOrderDto = {
        userId: 2,
        items: [
          {
            albumId: 3,
            quantity: 1,
            price: 15.99,
          },
        ],
      };
      const singleItemOrder: Order = {
        ...mockOrder,
        id: 2,
        userId: 2,
        total: 15.99,
        items: [{ ...mockOrderItem, id: 3, albumId: 3, quantity: 1, price: 15.99 }],
      };
      mockOrdersService.createOrder.mockResolvedValue(singleItemOrder);

      const result = await controller.createOrder(createOrderDto);

      expect(result).toEqual(singleItemOrder);
      expect(result.total).toBe(15.99);
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
    });

    it('should create an order with large quantity', async () => {
      const createOrderDto = {
        userId: 1,
        items: [
          {
            albumId: 1,
            quantity: 10,
            price: 19.99,
          },
        ],
      };
      const largeQuantityOrder: Order = {
        ...mockOrder,
        total: 199.9,
        items: [{ ...mockOrderItem, quantity: 10 }],
      };
      mockOrdersService.createOrder.mockResolvedValue(largeQuantityOrder);

      const result = await controller.createOrder(createOrderDto);

      expect(result).toEqual(largeQuantityOrder);
      expect(result.total).toBe(199.9);
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
    });

    it('should handle errors when creating an order', async () => {
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
      const error = new Error('Creation failed');
      mockOrdersService.createOrder.mockRejectedValue(error);

      await expect(controller.createOrder(createOrderDto)).rejects.toThrow('Creation failed');
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
    });

    it('should handle database errors', async () => {
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
      const error = new Error('Database connection error');
      mockOrdersService.createOrder.mockRejectedValue(error);

      await expect(controller.createOrder(createOrderDto)).rejects.toThrow('Database connection error');
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('getUserOrders', () => {
    it('should return orders for a user', async () => {
      const userId = 1;
      const orders = [mockOrder];
      mockOrdersService.findOrdersByUser.mockResolvedValue(orders);

      const result = await controller.getUserOrders(userId);

      expect(result).toEqual(orders);
      expect(service.findOrdersByUser).toHaveBeenCalledWith(userId);
      expect(service.findOrdersByUser).toHaveBeenCalledTimes(1);
    });

    it('should return multiple orders for a user', async () => {
      const userId = 1;
      const orders = [
        mockOrder,
        { ...mockOrder, id: 2, total: 50.0 },
        { ...mockOrder, id: 3, total: 75.5 },
      ];
      mockOrdersService.findOrdersByUser.mockResolvedValue(orders);

      const result = await controller.getUserOrders(userId);

      expect(result).toEqual(orders);
      expect(result).toHaveLength(3);
      expect(service.findOrdersByUser).toHaveBeenCalledWith(userId);
    });

    it('should return an empty array when user has no orders', async () => {
      const userId = 2;
      mockOrdersService.findOrdersByUser.mockResolvedValue([]);

      const result = await controller.getUserOrders(userId);

      expect(result).toEqual([]);
      expect(service.findOrdersByUser).toHaveBeenCalledWith(userId);
    });

    it('should handle non-existent user', async () => {
      const userId = 999;
      mockOrdersService.findOrdersByUser.mockResolvedValue([]);

      const result = await controller.getUserOrders(userId);

      expect(result).toEqual([]);
      expect(service.findOrdersByUser).toHaveBeenCalledWith(userId);
    });

    it('should handle errors when fetching user orders', async () => {
      const userId = 1;
      const error = new Error('Database error');
      mockOrdersService.findOrdersByUser.mockRejectedValue(error);

      await expect(controller.getUserOrders(userId)).rejects.toThrow('Database error');
      expect(service.findOrdersByUser).toHaveBeenCalledWith(userId);
    });

    it('should handle different user IDs', async () => {
      const userId1 = 1;
      const userId2 = 2;
      const orders1 = [mockOrder];
      const orders2 = [{ ...mockOrder, id: 2, userId: 2 }];
      
      mockOrdersService.findOrdersByUser.mockResolvedValueOnce(orders1);
      mockOrdersService.findOrdersByUser.mockResolvedValueOnce(orders2);

      const result1 = await controller.getUserOrders(userId1);
      const result2 = await controller.getUserOrders(userId2);

      expect(result1).toEqual(orders1);
      expect(result2).toEqual(orders2);
      expect(service.findOrdersByUser).toHaveBeenCalledWith(userId1);
      expect(service.findOrdersByUser).toHaveBeenCalledWith(userId2);
      expect(service.findOrdersByUser).toHaveBeenCalledTimes(2);
    });
  });
});
