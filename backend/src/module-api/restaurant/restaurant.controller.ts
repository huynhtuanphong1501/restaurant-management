import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UploadedFiles, Query, Req } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantCreate } from './dto/createRestaurant.dto';
import { User } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/enum.constant';
import { RestaurantUpdate } from './dto/updateRestaurant.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

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

  @Post('updateImage/:restaurantId')
  @Roles(Role.OWNER, Role.ADMIN)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 },
  ]))
  async updateRestaurantImage(@UploadedFiles() files: { logo?: Express.Multer.File[], cover_image?: Express.Multer.File[] }, @User() user, @Param('restaurantId') restaurantId: string,) {
    const result = await this.restaurantService.updateRestaurantImage(files, user.id, restaurantId);
    return {
      result: result,
      message: 'update restaurant image success'
    }
  }

  @Get('listRestaurant')
  async listRestaurant(@User() user, @Req() request: Request) {
    const result = await this.restaurantService.listRestaurant(user.id, request);
    return {
      result: result,
      message: 'list restaurant success'
    }
  }

  @Get(':restaurantId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.KITCHEN, Role.WAITER, Role.CASHIER)
  async getRestaurant(@Param('restaurantId') restaurantId: string) {
    const result = await this.restaurantService.getRestaurant(restaurantId);
    return {
      result: result,
      message: 'get restaurant success'
    }
  }

  @Delete(':restaurantId')
  @Roles(Role.OWNER)
  async deleteRestaurant(@Param('restaurantId') restaurantId: string, @User() user) {
    const result = await this.restaurantService.deleteRestaurant(restaurantId, user.id);
    return {
      result: result,
      message: 'delete restaurant success'
    }
  }
}
