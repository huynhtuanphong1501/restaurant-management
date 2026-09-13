import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RestaurantTableService } from './restaurant-table.service';
@Controller('restaurant')
export class RestaurantTableController {
  constructor(private readonly restaurantTableService: RestaurantTableService) {}


}
