import { IsEnum, IsOptional, IsPhoneNumber, IsString, MaxLength } from "class-validator";
import { RestaurantStatus } from "src/common/constants/enum.constant";

export class RestaurantUpdate{
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    address?: string;

    @IsString()
    @IsOptional()
    @IsPhoneNumber('VN')
    phone?: string;

    @IsString()
    @IsOptional()
    @IsEnum(RestaurantStatus)
    status?: RestaurantStatus;
}