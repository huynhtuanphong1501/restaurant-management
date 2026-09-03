import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { RestaurantCreate } from './dto/createRestaurant.dto';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { TokenService } from 'src/module-system/token/token.service';
import { RestaurantUpdate } from './dto/updateRestaurant.dto';
import { CloudinaryService } from 'src/module-system/cloudinary/cloudinary.service';
import { paginate } from 'src/common/helpers/pagination.helper';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService, private token: TokenService, private cloudinary: CloudinaryService) { }
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

  async updateRestaurantImage(files: { logo?: Express.Multer.File[], cover_image?: Express.Multer.File[] }, userId: string, restaurantId: string) {
    const logoUrl = files.logo?.[0];
    const imageUrl = files.cover_image?.[0];
    
    if (!userId) {
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

    const res = await this.prisma.restaurants.findUnique({
      where: {
        id: BigInt(restaurantId),
      }
    });

    if (!res) {
      throw new BadRequestException('restaurant id not found');
    }

    if (res.logo && logoUrl) {
      const url = `logo/${res.logo.split('/logo/')[1].replace(/\.[^/.]+$/, '')}`;
      await this.cloudinary.delete(url);
    }

    if (res.cover_image && imageUrl) {
      const url = `coverImage/${res.cover_image.split('/coverImage/')[1].replace(/\.[^/.]+$/, '')}`;
      await this.cloudinary.delete(url);
    }

    const data: {
      logo?: string,
      cover_image?: string
    } = {}

    if (logoUrl) {
      const upload = await this.cloudinary.upload(logoUrl, 'logo');
      data.logo = upload.secure_url;
    }

    if (imageUrl) {
      const upload = await this.cloudinary.upload(imageUrl, 'coverImage');
      data.cover_image = upload.secure_url;
    }

     const result = await this.prisma.restaurants.update({
        where: {
          id: BigInt(restaurantId),
        },
        data: data,
        select: {
          id: true,
          name: true,
          logo: true,
          cover_image: true
        },
      });

    return {
      ...result,
      id: result.id.toString()
    };
  }

  async getRestaurant(restaurantId: string) { 
    const res = await this.prisma.restaurants.findUnique({
      where: {
        id: BigInt(restaurantId),
      }
    });
    if (!res) {
      throw new BadRequestException('restaurant id not found');
    }

    return {
      ...res,
      id: res.id.toString(),
      owner_id: res.owner_id.toString()
    };
  }

  async listRestaurant(userId: string, request: Request) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: BigInt(userId)
      }
    });
    if (!user) {
      throw new BadRequestException('user id not found');
    }

    const { page, limit, index, where } = paginate(request, ['name', 'description', 'address', 'phone']);
    const whereCondition = {
      ...where,
      owner_id: BigInt(userId),
    };
    const res = await this.prisma.restaurants.findMany({
      where: whereCondition,
      skip: index,
      take: limit,
    });

    const total = await this.prisma.restaurants.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: res.map((restaurant) => ({
        ...restaurant,
        id: restaurant.id.toString(),
        owner_id: restaurant.owner_id.toString()
      })),
      total: total,
      totalPages: totalPages,
      currentPage: page,
      limit: limit
    };
  }

  async deleteRestaurant(restaurantId: string, userId: string) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: BigInt(userId)
      }
    });
    if (!user) {
      throw new BadRequestException('user id not found');
    }
    const res = await this.prisma.restaurants.findUnique({
      where: {
        id: BigInt(restaurantId),
        owner_id: BigInt(userId)
      }
    });
    if (!res) {
      throw new BadRequestException('restaurant id not found');
    }

    if (res.logo) {
      const url = `logo/${res.logo.split('/logo/')[1].replace(/\.[^/.]+$/, '')}`;
      await this.cloudinary.delete(url);
    }

    if (res.cover_image) {
      const url = `coverImage/${res.cover_image.split('/coverImage/')[1].replace(/\.[^/.]+$/, '')}`;
      await this.cloudinary.delete(url);
    }

    await this.prisma.restaurants.delete({
      where: {
        id: BigInt(restaurantId)
      }
    });

    return {
      message: 'delete restaurant success'
    };
  }

}
