import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RestaurantMemberService } from './restaurant-member.service';
import { CreateRestaurantMemberDto } from './dto/create-restaurant-member.dto';
import { UpdateRestaurantMemberDto } from './dto/update-restaurant-member.dto';

@Controller('restaurant-member')
export class RestaurantMemberController {
  constructor(private readonly restaurantMemberService: RestaurantMemberService) {}

  @Post()
  create(@Body() createRestaurantMemberDto: CreateRestaurantMemberDto) {
    return this.restaurantMemberService.create(createRestaurantMemberDto);
  }

  @Get()
  findAll() {
    return this.restaurantMemberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantMemberService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRestaurantMemberDto: UpdateRestaurantMemberDto) {
    return this.restaurantMemberService.update(+id, updateRestaurantMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantMemberService.remove(+id);
  }
}
