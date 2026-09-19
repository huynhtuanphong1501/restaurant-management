import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { UpdateOrderDto } from './dto/updateOrder.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/enum.constant';



@Controller('restaurant')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }
  
  @Public()
  @Post('order')
  async createOrder(@Body() dto: CreateOrderDto) {
    const result = await this.ordersService.createOrder(dto);
    return {
      result: result,
      message: "create order"
    }
  }

  @Put(':restaurantId/orders/:orderId/status')
  @Roles(Role.ADMIN , Role.CASHIER, Role.KITCHEN, Role.MANAGER, Role.OWNER, Role.WAITER)
  async updateOrder(@Body() dto: UpdateOrderDto, @Param('orderId') orderId: string, @Param('restaurantId') restaurantId: string) {
    const result = await this.ordersService.updateOrder(dto, orderId, restaurantId);
    return {
      result: result,
      message: "update order"
    }
  }

  // @Get(':restaurantId/orders')
  

  // @Get(':restaurantId/orders/:orderId')
}
