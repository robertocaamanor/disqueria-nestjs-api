import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersServiceService } from './orders-service.service';

@Controller()
export class OrdersServiceController {
  constructor(private readonly ordersService: OrdersServiceService) {}

  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() data: any) {
    return this.ordersService.createOrder(data);
  }

  @MessagePattern({ cmd: 'get_user_orders' })
  async getUserOrders(@Payload() userId: number) {
    return this.ordersService.findOrdersByUser(userId);
  }
}
