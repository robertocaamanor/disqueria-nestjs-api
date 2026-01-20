import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersServiceService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async createOrder(data: { userId: number; items: { albumId: number; quantity: number; price: number }[] }): Promise<Order> {
    const order = new Order();
    order.userId = data.userId;
    order.items = data.items.map(item => {
      const orderItem = new OrderItem();
      orderItem.albumId = item.albumId;
      orderItem.quantity = item.quantity;
      orderItem.price = item.price;
      return orderItem;
    });
    order.total = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return this.orderRepository.save(order);
  }

  async findOrdersByUser(userId: number): Promise<Order[]> {
    return this.orderRepository.find({ where: { userId }, relations: ['items'] });
  }
}
