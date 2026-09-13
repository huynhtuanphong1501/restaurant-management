import { Module } from '@nestjs/common';
import { RestaurantTableService } from './restaurant-table.service';
import { RestaurantTableController } from './restaurant-table.controller';

@Module({
  controllers: [RestaurantTableController],
  providers: [RestaurantTableService],
})
export class RestaurantTableModule {}
