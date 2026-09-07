import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Max, Min } from 'class-validator';
import { CategoryStatus } from '../../../common/constants/enum.constant';
export class CreateCatagoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Max(4)
    @Min(1)
    sort_order: number;

    @IsEnum(CategoryStatus)
    status: CategoryStatus;
 }