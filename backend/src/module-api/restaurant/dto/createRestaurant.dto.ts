import { IsOptional, IsPhoneNumber, IsString, MaxLength } from 'class-validator';
export class RestaurantCreate{
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    address?: string;

    @IsPhoneNumber('VN')
    phone?: string;
}