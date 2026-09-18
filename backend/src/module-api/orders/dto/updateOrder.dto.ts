import { IsEnum } from "class-validator";
import { OrderStatus } from "src/common/constants/enum.constant";

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}