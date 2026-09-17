import { IsString, IsInt, IsOptional, ValidateNested, Min } from "class-validator"
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  food_id: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateOrderDto {
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  note?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}