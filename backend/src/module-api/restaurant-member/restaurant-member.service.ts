import { Injectable } from '@nestjs/common';
import { CreateRestaurantMemberDto } from './dto/create-restaurant-member.dto';
import { UpdateRestaurantMemberDto } from './dto/update-restaurant-member.dto';

@Injectable()
export class RestaurantMemberService {
  create(createRestaurantMemberDto: CreateRestaurantMemberDto) {
    return 'This action adds a new restaurantMember';
  }

  findAll() {
    return `This action returns all restaurantMember`;
  }

  findOne(id: number) {
    return `This action returns a #${id} restaurantMember`;
  }

  update(id: number, updateRestaurantMemberDto: UpdateRestaurantMemberDto) {
    return `This action updates a #${id} restaurantMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} restaurantMember`;
  }
}
