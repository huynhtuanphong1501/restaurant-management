import { IsString, IsOptional, MaxLength, IsPhoneNumber } from "class-validator";
export class UpdateInfo{
    @IsString()
    @IsOptional()
    @MaxLength(100)
    full_name?: string;

    @IsString()
    @IsOptional()
    @IsPhoneNumber('VN')
    phone?: string;
}