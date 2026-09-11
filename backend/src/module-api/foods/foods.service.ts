import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/module-system/cloudinary/cloudinary.service';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { CreateFoodDto } from './dto/createFood.dto';
import { FoodStatus } from 'src/common/constants/enum.constant';
import { paginate } from 'src/common/helpers/pagination.helper';


@Injectable()
export class FoodsService {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) { }
  async createFood(dto: CreateFoodDto) {
    const { restaurant_id, category_id, name, description, price, status, sort_order } = dto;
    const checkRestaurant = await this.prisma.restaurants.findFirst({
      where: {
        id: BigInt(restaurant_id)
      }
    })
    if (!checkRestaurant) {
      throw new BadRequestException("restaurant id not found");
    }
    const checkCategory = await this.prisma.categories.findFirst({
      where: {
        id: BigInt(category_id),
        restaurant_id: BigInt(restaurant_id)
      }
    });
    if (!checkCategory) {
      throw new BadRequestException("category not found");
    }

    const checkName = await this.prisma.foods.findFirst({
      where: {
        name: name
      }
    });
    if (checkName) {
      throw new BadRequestException("food already in DB");
    }

    const result = await this.prisma.foods.create({
      data: {
        restaurant_id: BigInt(restaurant_id),
        category_id: BigInt(category_id),
        name: name,
        description: description,
        price: price,
        status: status ?? FoodStatus.AVAILABLE,
        sort_order: sort_order
      }
    });

    return {
      ...result,
      restaurant_id: result.restaurant_id.toString(),
      id: result.id.toString(),
      category_id: result.category_id.toString()
    }
  }

  async getAllFood(request: Request) {
    const { page, limit, index, where } = paginate(request, ["name", "description"]);
    const foods = await this.prisma.foods.findMany({
      where: where,
      take: limit,
      skip: index
    })

    const total = await this.prisma.foods.count({
      where: where
    });

    const totalPage = Math.ceil(total / limit);

    return {
      data: foods.map(food => ({
        ...food,
        id: food.id.toString(),
        restaurant_id: food.restaurant_id.toString(),
        category_id: food.category_id.toString()
      })),
      total,
      totalPage,
      page,
      limit
    }
  }
}
