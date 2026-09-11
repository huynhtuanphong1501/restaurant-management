import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { FoodStatus } from "src/common/constants/enum.constant";

export class CreateFoodDto {
    @IsString()
    restaurant_id: string;

    @IsString()
    category_id: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsEnum(FoodStatus)
    status: FoodStatus;

    @Max(4)
    @Min(1)
    @IsNumber()
    sort_order: number;
 }