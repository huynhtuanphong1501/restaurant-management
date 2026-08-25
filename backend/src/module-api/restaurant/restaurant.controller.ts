import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantCreate } from './dto/createRestaurant.dto';
import { User } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/enum.constant';
import { RestaurantUpdate } from './dto/updateRestaurant.dto';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post('create')
  async create(@Body() dto: RestaurantCreate, @User() user) {
    const result = await this.restaurantService.create(dto, user.id);
    return {
      result: result,
      message: 'create restaurant success'
    }
  }

  @Post('update/:restaurantId')
  @Roles(Role.OWNER, Role.ADMIN)
  async updateRestaurant(@Body() dto: RestaurantUpdate, @User() user, @Param('restaurantId') restaurantId: string,) {
    const result = await this.restaurantService.updateRestaurant(dto, user.id, restaurantId);
    return {
      result: result,
      message: 'update restaurant success'
    }
  }



}
