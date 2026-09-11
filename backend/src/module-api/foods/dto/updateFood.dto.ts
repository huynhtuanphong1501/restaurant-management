import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { FoodStatus } from "src/common/constants/enum.constant";

export class UpdateFoodDto {
    @IsString()
    id: string;

    @IsString()
    restaurant_id: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
        @IsOptional()
    price?: number;

    @IsEnum(FoodStatus)
        @IsOptional()
    status?: FoodStatus;

    @Max(4)
    @Min(1)
    @IsNumber()
        @IsOptional()
    sort_order?: number;
 }