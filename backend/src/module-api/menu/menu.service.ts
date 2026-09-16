import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module-system/prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) { }
  async getMenu(token: string) {
    const qr = await this.prisma.table_qr_codes.findFirst({
      where: {
        token: token
      },
      include: {
        restaurant_tables: true
      }
    });
    if (!qr) {
      throw new BadRequestException("qr not found");
    }

    if (qr.is_active !== true) {
      throw new BadRequestException("qr is inactive");
    }

    if (qr.expires_at && qr.expires_at < new Date()) {
      throw new BadRequestException("qr has expired");
    }

    const restaurantId = qr.restaurant_tables.restaurant_id;

    const restaurant = await this.prisma.restaurants.findUnique({
      where: {
        id: restaurantId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        phone: true,
        logo: true,
        cover_image: true,
      },
    });

    if (!restaurant) {
      throw new BadRequestException("restaurant not found");
    }

    const categories = await this.prisma.categories.findMany({
      where: {
        restaurant_id: restaurantId,
        status: 'ACTIVE',
      },
      orderBy: {
        sort_order: 'asc',
      },
      include: {
        foods: {
          where: {
            restaurant_id: restaurantId,
            status: 'AVAILABLE',
            deleted_at: null,
          },
          orderBy: {
            sort_order: 'asc',
          },
        },
      },
    });

    return {
      restaurant: {
        id: restaurant.id.toString(),
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        logo: restaurant.logo,
        cover_image: restaurant.cover_image,
      },

      table: {
        id: qr.restaurant_tables.id.toString(),
        name: qr.restaurant_tables.name,
        capacity: qr.restaurant_tables.capacity,
      },

      categories: categories.map((category) => ({
        id: category.id.toString(),
        name: category.name,
        description: category.description,
        image: category.image,

        foods: category.foods.map((food) => ({
          id: food.id.toString(),
          name: food.name,
          description: food.description,
          price: food.price,
          image: food.image,
          sort_order: food.sort_order,
        })),
      })),
    };
  }
}
