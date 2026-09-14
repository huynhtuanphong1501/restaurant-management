import { IsEnum, IsNumber, IsString, Min, Max } from "class-validator";
import { TableStatus } from "src/common/constants/enum.constant";

export class CreateTableDto{
    @IsString()
    name: string;

    @IsNumber()
    @Max(8)
    @Min(1)
    capacity: number;

    @IsEnum(TableStatus)
    status: TableStatus;
}