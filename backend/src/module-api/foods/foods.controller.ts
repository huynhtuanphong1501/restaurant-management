import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { Role } from 'src/common/constants/enum.constant';
import { Roles } from 'src/common/decorators/role.decorator';
import { CreateFoodDto } from './dto/createFood.dto';
import { UpdateFoodDto } from './dto/updateFood.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Post('createFood')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async createFood(@Body() dto: CreateFoodDto ) {
    const result = await this.foodsService.createFood(dto);
    return {
      result: result,
      message: 'Food created successfully'
    }
  }

  @Get("getAll")
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async getAllFood(@Req() request: Request) {
    const result = await this.foodsService.getAllFood(request);
    return {
      result: result,
      message: 'Get all food'
    }
  }
  
  @Get("getDetail/:restaurantId/:foodId")
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async getDetailFood(@Param('restaurantId') restaurantId: string, @Param('foodId') foodId: string) {
    const result = await this.foodsService.getDetailFood(restaurantId, foodId);
    return {
      result: result,
      message: 'get detail food'
    }
  }

  @Put('updateFood')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async updateFood(@Body() dto: UpdateFoodDto) {
    const result = await this.foodsService.updateFood(dto);
    return {
      result: result,
      message: 'update food'
    }
  }

  @Put('updateImg/:restaurantId/:foodId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @UseInterceptors(FileInterceptor('image'))
  async updateImg(@UploadedFile() image: Express.Multer.File, @Param('restaurantId') restaurantId: string, @Param('foodId') foodId: string) {
    const result = await this.foodsService.uploadImg(image, restaurantId, foodId);
    return {
      result: result,
      message: 'upload image'
    }
  }
  
  @Put("deleteFood/:restaurantId/:foodId")
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async deleteFood(@Param('restaurantId') restaurantId: string, @Param('foodId') foodId: string) {
    const result = await this.foodsService.deleteFood( restaurantId, foodId);
    return {
      result: result,
      message: 'deleteFood'
    }
  }
}

