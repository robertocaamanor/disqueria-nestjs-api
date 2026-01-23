import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersServiceService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @Inject('CATALOG_SERVICE') private client: ClientProxy,
  ) { }

  async createOrder(data: { userId: number; items: { albumId: number; quantity: number; price: number }[] }): Promise<Order> {
    // Decrease stock for each item
    for (const item of data.items) {
      await firstValueFrom(this.client.send({ cmd: 'decrease_stock' }, { id: item.albumId, quantity: item.quantity }));
    }

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
