import { IsEnum, IsOptional, IsString } from "class-validator";
import { RestaurantMemberStatus, Role } from "src/common/constants/enum.constant";

export class UpdateMemberDto {
    @IsString()
    user_id: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @IsEnum(RestaurantMemberStatus)
    @IsOptional()
    status?: RestaurantMemberStatus;
 }