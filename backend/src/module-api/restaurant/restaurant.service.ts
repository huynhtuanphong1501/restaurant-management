import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { RestaurantCreate } from './dto/createRestaurant.dto';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { TokenService } from 'src/module-system/token/token.service';
import { RestaurantUpdate } from './dto/updateRestaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService, private token: TokenService) { }
  async create(dto: RestaurantCreate, userId: string) {
    if(!userId){
      throw new BadRequestException('user not found');
    }
    const user = await this.prisma.users.findUnique({
      where: {
        id: BigInt(userId)
      }
    });
    if (!user) {
      throw new BadRequestException('user id not found');
    }

    const checkName = await this.prisma.restaurants.findFirst({
      where: {
        name: dto.name
      }
    });

    if (checkName) {
      throw new ForbiddenException('This restaurant already exits');
    }

    const result = await this.prisma.$transaction(async (res) => {
      const restaurant = await res.restaurants.create({
        data: {
          owner_id: user.id,
          name: dto.name,
          description: dto.description,
          address: dto.address,
          phone: dto.phone
        }
      });
      await res.restaurant_members.create({
        data: {
          restaurant_id: restaurant.id,
          user_id: user.id,
          role: 'OWNER',
          status: 'ACTIVE'
        }
      });
      return restaurant;
    });

    return {
      ...result,
      id: result.id.toString(),
      owner_id: result.owner_id.toString()
    };
  }

  async updateRestaurant(dto: RestaurantUpdate, userId: string, restaurantId: string) {
    if(!userId){
      throw new BadRequestException('user not found');
    }
    const user = await this.prisma.users.findUnique({
      where: {
        id: BigInt(userId)
      }
    });
    if (!user) {
      throw new BadRequestException('user id not found');
    }

    const checkName = await this.prisma.restaurants.findFirst({
      where: {
        name: dto.name
      }
    });

    if (checkName) {
      throw new ForbiddenException('This restaurant already exits');
    }

    const result = await this.prisma.restaurants.update({
      where: {
        id: BigInt(restaurantId)
      },
      data: {
        name: dto.name,
        description: dto.description,
        address: dto.address,
        phone: dto.phone,
        status: dto.status
      }
    });

    return {
      ...result,
      id: result.id.toString(),
      owner_id: result.owner_id.toString()
    };
  }

}
