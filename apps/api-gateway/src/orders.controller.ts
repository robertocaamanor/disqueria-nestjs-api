import { Controller, Get, Post, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from '@app/shared';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject('ORDERS_SERVICE') private client: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  createOrder(@Body() data: CreateOrderDto) {
    return this.client.send({ cmd: 'create_order' }, data);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get orders by user ID' })
  getUserOrders(@Param('userId') userId: number) {
    return this.client.send({ cmd: 'get_user_orders' }, parseInt(userId.toString()));
  }
}
