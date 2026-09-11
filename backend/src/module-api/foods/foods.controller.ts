import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { Role } from 'src/common/constants/enum.constant';
import { Roles } from 'src/common/decorators/role.decorator';
import { CreateFoodDto } from './dto/createFood.dto';

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
}
