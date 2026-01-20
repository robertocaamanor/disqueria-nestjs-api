import { IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: 'The ID of the album to order' })
  @IsNumber()
  albumId: number;

  @ApiProperty({ description: 'The quantity of the album to order', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'The price per unit at the time of order' })
  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'The ID of the user placing the order' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'List of items in the order', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
