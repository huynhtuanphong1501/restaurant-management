import { Controller, Get, Post, Body, Delete, Param, Put, Req } from '@nestjs/common';
import { RestaurantTableService } from './restaurant-table.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/enum.constant';
import { CreateTableDto } from './dto/createTabke.dto';
import type { Request } from 'express';
import { UpdateTableDto } from './dto/updateTable.dto';

@Controller('restaurant')
export class RestaurantTableController {
  constructor(private readonly restaurantTableService: RestaurantTableService) {}

  @Post(':restaurantId/tables/create')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async createTable(@Param('restaurantId') restaurantId: string, @Body() dto: CreateTableDto) {
    const result = await this.restaurantTableService.createTable(restaurantId, dto);
    return {
      result: result,
      message: "create tables"
    }
  }

  @Get(':restaurantId/tables')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async getAllTable(@Param('restaurantId') restaurantId: string, @Req() req: Request) {
    const result = await this.restaurantTableService.getAllTable(restaurantId, req);
    return {
      result: result,
      message: "get all tables"
    }
  }

  @Get(':restaurantId/tables/:tableId')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async getTable(@Param('restaurantId') restaurantId: string, @Param('tableId') tableId: string) {
    const result = await this.restaurantTableService.getTable(restaurantId, tableId);
    return {
      result: result,
      message: "get table detail"
    }
  }

  @Put(':restaurantId/tables/update/:tableId')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async updateTable(@Param('restaurantId') restaurantId: string, @Param('tableId') tableId: string, @Body() dto: UpdateTableDto) {
    const result = await this.restaurantTableService.updateTable(restaurantId, tableId, dto);
    return {
      result: result,
      message: "update table"
    }
  }

  @Delete(':restaurantId/tables/delete/:tableId')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async deleteTable(@Param('restaurantId') restaurantId: string, @Param('tableId') tableId: string) {
    const result = await this.restaurantTableService.deleteTable(restaurantId, tableId);
    return {
      result: result,
      message: "delete table"
    }
  }
}
