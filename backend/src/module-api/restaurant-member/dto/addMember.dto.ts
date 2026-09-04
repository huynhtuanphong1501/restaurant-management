import { IsEnum, IsString } from "class-validator";
import { Role } from "src/common/constants/enum.constant";

export class AddMemberDto {
    @IsString()
    user_id: string;
    
    @IsString()
    @IsEnum(Role)
    role: Role;
 }