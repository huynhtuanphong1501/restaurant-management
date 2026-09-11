import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/module-system/cloudinary/cloudinary.service';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { CreateFoodDto } from './dto/createFood.dto';
import { FoodStatus } from 'src/common/constants/enum.constant';
import { paginate } from 'src/common/helpers/pagination.helper';
import { UpdateFoodDto } from './dto/updateFood.dto';


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

  async getDetailFood(restaurantId: string, foodId: string){
    const checkResId = await this.prisma.restaurants.findFirst({
      where: {
        id: BigInt(restaurantId)
      }
    });
    if (!checkResId) {
      throw new BadRequestException("restaurant id not found");
    }
    const result = await this.prisma.foods.findFirst({
      where: {
        id: BigInt(foodId),
        restaurant_id: BigInt(restaurantId)
      }
    });

    if (!result) {
      throw new BadRequestException("food not found");
    }

    return {
      ...result,
      id: result.id.toString(),
      restaurant_id: result.restaurant_id.toString(),
      category_id: result.category_id.toString()
    }
  }

  async updateFood(dto: UpdateFoodDto) {
    const { id, restaurant_id, name, description, price, status, sort_order } = dto;

    const checkRestaurant = await this.prisma.restaurants.findFirst({
      where: {
        id: BigInt(restaurant_id)
      }
    })
    if (!checkRestaurant) {
      throw new BadRequestException("restaurant id not found");
    }

    const checkName = await this.prisma.foods.findFirst({
      where: {
        name: name
      }
    });
    if (checkName) {
      throw new BadRequestException("food already in DB");
    }

    const result = await this.prisma.foods.update({
      where: {
        id: BigInt(id),
      },
      data: {
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

  async uploadImg(image: Express.Multer.File, restaurantId: string, foodId: string) {
    const food = await this.prisma.foods.findUnique({
      where: {
        id: BigInt(foodId),
        restaurant_id: BigInt(restaurantId)
      }
    });
    if (!food) {
      throw new BadRequestException('food not found');
    }

    if(food.image && image) {
      const url = `foods/${food.image.split('/foods/')[1].replace(/\.[^/.]+$/, '')}`;
      await this.cloudinary.delete(url);
    }

    const upload = await this.cloudinary.upload(image, 'foods');

    const result = await this.prisma.foods.update({
      where: {
        id: BigInt(foodId)
      },
      data: {
        image: upload.secure_url
      }
    });

    return {
      ...result,
      restaurant_id: result.restaurant_id.toString(),
      id: result.id.toString(),
      category_id: result.category_id.toString()
    };
  }

  async deleteFood(restaurantId: string, foodId: string) {
     const food = await this.prisma.foods.findUnique({
      where: {
        id: BigInt(foodId),
         restaurant_id: BigInt(restaurantId),
        deleted_at: null,
      }
    });
    if (!food) {
      throw new BadRequestException('food not found');
    }
    const checkRestaurant = await this.prisma.restaurants.findFirst({
      where: {
        id: BigInt(restaurantId)
      }
    })
    if (!checkRestaurant) {
      throw new BadRequestException("restaurant id not found");
    }

     const result = await this.prisma.foods.update({
      where: {
         id: BigInt(foodId),
        restaurant_id: BigInt(restaurantId)
      },
       data: {
        status: FoodStatus.UNAVAILABLE,
        deleted_at: new Date()
      }
    });

    return {
      ...result,
      restaurant_id: result.restaurant_id.toString(),
      id: result.id.toString(),
      category_id: result.category_id.toString()
    };
  }

}
