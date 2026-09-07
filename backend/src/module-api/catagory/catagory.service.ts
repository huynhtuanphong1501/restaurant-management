import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { CreateCatagoryDto } from './dto/createCata.dto';
import { CategoryStatus } from 'src/common/constants/enum.constant';
import { paginate } from 'src/common/helpers/pagination.helper';
import {UpdateCataDto} from './dto/updateCata.dto';
import { CloudinaryService } from 'src/module-system/cloudinary/cloudinary.service';


@Injectable()
export class CatagoryService {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) { }
  async createCategory(dto: CreateCatagoryDto, restaurantId: string) {
    const checkRestaurantID = await this.prisma.restaurants.findFirst({
      where: {
        id: BigInt(restaurantId),
      }
    });
    if (!checkRestaurantID) {
      throw new BadRequestException('Restaurant ID does not match');
    }

    const checkCategoryName = await this.prisma.categories.findFirst({
      where: {
        restaurant_id: BigInt(restaurantId),
        name: dto.name
      }
    });
    if (checkCategoryName) {
      throw new BadRequestException('Category name already exists for this restaurant');
    }

    const checkSortOrder = await this.prisma.categories.findFirst({
      where: {
        restaurant_id: BigInt(restaurantId),
        sort_order: dto.sort_order
      }
    });

    if (checkSortOrder) {
      throw new BadRequestException('Sort order already exists for this restaurant');
    }

    const result = await this.prisma.categories.create({
      data: {
        restaurant_id: BigInt(restaurantId),
        name: dto.name,
        description: dto.description,
        sort_order: dto.sort_order,
        status: dto.status ?? CategoryStatus.ACTIVE
      }
    });

    return {
      ...result,
      restaurant_id: result.restaurant_id.toString(),
      id: result.id.toString()
    }
  }

  async getCategories(restaurantId: string, request: Request) {
    const checkRestaurantID = await this.prisma.restaurants.findFirst({
      where: {
        id: BigInt(restaurantId),
      }
    });
    if (!checkRestaurantID) {
      throw new BadRequestException('Restaurant ID does not match');
    }

    const { page, limit, index, where } = paginate(request, ['name', 'description']);

    const categories = await this.prisma.categories.findMany({
      where: where,
      skip: index,
      take: limit
    });

    const total = await this.prisma.categories.count({
      where: where
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: categories.map(category => ({
        ...category,
        restaurant_id: category.restaurant_id.toString(),
        id: category.id.toString(),
      })),
      total,
      totalPages,
      page,
      limit,
    };
  }

  async getCategoryDetails(restaurantId: string, categoryId: string) {
    const checkRestaurantID = await this.prisma.restaurants.findFirst({
      where: {
        id: BigInt(restaurantId),
      }
    });
    if (!checkRestaurantID) {
      throw new BadRequestException('Restaurant ID does not match');
    }

    const category = await this.prisma.categories.findUnique({
      where: {
        id: BigInt(categoryId),
        restaurant_id: BigInt(restaurantId)
      }
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return {
      ...category,
      restaurant_id: category.restaurant_id.toString(),
      id: category.id.toString()
    };
  }

  async updateCategory(restaurantId: string, categoryId: string, dto: UpdateCataDto) {
    const checkRestaurantID = await this.prisma.restaurants.findFirst({
      where: {
        id: BigInt(restaurantId),
      }
    });
    if (!checkRestaurantID) {
      throw new BadRequestException('Restaurant ID does not match');
    }

    const category = await this.prisma.categories.findUnique({
      where: {
        id: BigInt(categoryId)
      }
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }
      
      if (dto.name !== undefined && dto.name !== category.name) {

        const checkCategoryName = await this.prisma.categories.findFirst({
          where: {
            name: dto.name,
            restaurant_id: BigInt(restaurantId)
          }
        });
        if (checkCategoryName) {
          throw new BadRequestException('Category name already exists');
        }
      }

      if (dto.sort_order !== undefined && dto.sort_order !== category.sort_order) {
        const checkSortOrder = await this.prisma.categories.findFirst({
          where: {
            sort_order: dto.sort_order,
          }
        });
        if (checkSortOrder) {
          throw new BadRequestException('Sort order already exists');
        }
      }


      const result = await this.prisma.categories.update({
        where: {
          id: BigInt(categoryId),
          restaurant_id: BigInt(restaurantId)
        },
        data: {
          name: dto.name ?? category.name,
          description: dto.description ?? category.description,
          sort_order: dto.sort_order ?? category.sort_order,
          status: dto.status ?? category.status
        }
      });

      return {
        ...result,
        restaurant_id: result.restaurant_id.toString(),
        id: result.id.toString()
      };
  }

  async updateCategoryImage(restaurantId: string, categoryId: string, image: Express.Multer.File) {
    const category = await this.prisma.categories.findUnique({
      where: {
        id: BigInt(categoryId),
        restaurant_id: BigInt(restaurantId)
      }
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if(category.image && image) {
      const url = `category/${category.image.split('/category/')[1].replace(/\.[^/.]+$/, '')}`;
      await this.cloudinary.delete(url);
    }

    const upload = await this.cloudinary.upload(image, 'category');

    const result = await this.prisma.categories.update({
      where: {
        id: BigInt(categoryId)
      },
      data: {
        image: upload.secure_url
      }
    });

    return {
      ...result,
      restaurant_id: result.restaurant_id.toString(),
      id: result.id.toString()
    };
  }

  async deleteCategory(restaurantId: string, categoryId: string) {
    const category = await this.prisma.categories.findUnique({
      where: {
        id: BigInt(categoryId),
        restaurant_id: BigInt(restaurantId)
      }
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if(category.image) {
      const url = `category/${category.image.split('/category/')[1].replace(/\.[^/.]+$/, '')}`;
      await this.cloudinary.delete(url);
    }

    const result = await this.prisma.categories.delete({
      where: {
        id: BigInt(categoryId),
        restaurant_id: BigInt(restaurantId)
      }
    });

    return {
      ...result,
      restaurant_id: result.restaurant_id.toString(),
      id: result.id.toString()
    };
  }
}
