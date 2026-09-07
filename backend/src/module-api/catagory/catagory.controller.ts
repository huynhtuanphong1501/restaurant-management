import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CatagoryService } from './catagory.service';
import { CreateCatagoryDto } from './dto/createCata.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/enum.constant';
import { UpdateCataDto } from './dto/updateCata.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('catagory')
export class CatagoryController {
  constructor(private readonly catagoryService: CatagoryService) {}

  @Post(":restaurantId")
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async createCategory(@Body() dto: CreateCatagoryDto, @Param('restaurantId') restaurantId: string) {
    const result = await this.catagoryService.createCategory(dto, restaurantId );
    return {
      result: result,
      message: 'Category created successfully'
    };
  }

  @Get(":restaurantId")
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async getCategories(@Param('restaurantId') restaurantId: string, @Req() request: Request) {
    const result = await this.catagoryService.getCategories(restaurantId, request);
    return {
      result: result,
      message: 'Categories fetched successfully'
    };
  }

  @Get(":restaurantId/details/:categoryId")
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async getCategoryDetails(@Param('restaurantId') restaurantId: string, @Param('categoryId') categoryId: string) {
    const result = await this.catagoryService.getCategoryDetails(restaurantId, categoryId);
    return {
      result: result,
      message: 'Category details fetched successfully'
    };
  }

  @Put(":restaurantId/update/:categoryId")
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async updateCategory(@Param('restaurantId') restaurantId: string, @Param('categoryId') categoryId: string, @Body() dto: UpdateCataDto) {
    const result = await this.catagoryService.updateCategory(restaurantId, categoryId, dto);
    return {
      result: result,
      message: 'Category updated successfully'
    };
  }

  @Put(":restaurantId/img/:categoryId")
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @UseInterceptors(FileInterceptor('image'))
  async updateCategoryImage(@Param('restaurantId') restaurantId: string, @Param('categoryId') categoryId: string, @UploadedFile() image: Express.Multer.File) {
    const result = await this.catagoryService.updateCategoryImage(restaurantId, categoryId, image);
    return {
      result: result,
      message: 'Category image updated successfully'
    };
  }

  @Delete(":restaurantId/delete/:categoryId")
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async deleteCategory(@Param('restaurantId') restaurantId: string, @Param('categoryId') categoryId: string) {
    const result = await this.catagoryService.deleteCategory(restaurantId, categoryId);
    return {
      result: result,
      message: 'Category deleted successfully'
    };
  }
}
