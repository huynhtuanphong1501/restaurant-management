import { IsEnum, IsOptional, IsString, Max, Min } from "class-validator";
import { CategoryStatus } from "src/common/constants/enum.constant";

export class UpdateCataDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @Max(4)
    @Min(1)
    sort_order?: number;

    @IsOptional()
    @IsEnum(CategoryStatus)
    status?: CategoryStatus;
}