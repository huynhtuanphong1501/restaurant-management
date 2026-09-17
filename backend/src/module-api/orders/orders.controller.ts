import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/createOrder.dto';


@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }
  
  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    const result = await this.ordersService.createOrder(dto);
    return {
      result: result,
      message: "create order"
    }
  }


}
