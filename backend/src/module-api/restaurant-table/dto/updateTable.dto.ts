import { IsEnum, IsNumber, IsString, Min, Max, IsOptional } from "class-validator";
import { TableStatus } from "src/common/constants/enum.constant";

export class UpdateTableDto{
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @Max(8)
    @Min(1)
    @IsOptional()
    capacity?: number;

    @IsEnum(TableStatus)
    @IsOptional()
    status?: TableStatus;
}