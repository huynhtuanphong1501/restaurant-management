import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Put } from '@nestjs/common';
import { RestaurantMemberService } from './restaurant-member.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/enum.constant';
import { AddMemberDto } from './dto/addMember.dto';
import type { Request } from 'express';
import { UpdateMemberDto } from './dto/updateMember.dto';


@Controller('restaurant')
export class RestaurantMemberController {
  constructor(private readonly restaurantMemberService: RestaurantMemberService) {}
  @Post(':restaurantId/member')
  @Roles(Role.OWNER, Role.ADMIN)
  async addMemberToRestaurant(@Param('restaurantId') restaurantId: string, @Body() body: AddMemberDto) {
    const result = await this.restaurantMemberService.addMemberToRestaurant(restaurantId, body);
    return {
      result: result,
      message: 'add member to restaurant success'
    }
  }

  @Get(':restaurantId/member')
  @Roles(Role.OWNER, Role.ADMIN)
  async getMembersOfRestaurant(@Param('restaurantId') restaurantId: string, @Req() request: Request) {
    const result = await this.restaurantMemberService.getMembersOfRestaurant(restaurantId, request);
    return {
      result: result,
      message: 'get members of restaurant success'
    }
  }

  @Get(':restaurantId/member/:memberId')
  @Roles(Role.OWNER, Role.ADMIN)
  async getMemberById(@Param('restaurantId') restaurantId: string, @Param('memberId') memberId: string) {
    const result = await this.restaurantMemberService.getMemberById(restaurantId, memberId);
    return {
      result: result,
      message: 'get member by id success'
    }
  }

  @Put(':restaurantId/member/update')
  @Roles(Role.OWNER, Role.ADMIN)
  async updateMember(@Param('restaurantId') restaurantId: string, @Body() body: UpdateMemberDto) {
    const result = await this.restaurantMemberService.updateMember(restaurantId, body);
    return {
      result: result,
      message: 'update member success'
    }
  }

  
}
