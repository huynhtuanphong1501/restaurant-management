import { Module } from '@nestjs/common';
import { RestaurantMemberService } from './restaurant-member.service';
import { RestaurantMemberController } from './restaurant-member.controller';

@Module({
  controllers: [RestaurantMemberController],
  providers: [RestaurantMemberService],
})
export class RestaurantMemberModule {}
