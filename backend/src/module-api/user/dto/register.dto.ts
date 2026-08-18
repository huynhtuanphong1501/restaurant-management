import { IsEmail, IsPhoneNumber, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
export class RegisterDTO {
    @IsString()
    @MaxLength(100)
    full_name: string;

    @IsEmail()
    @MaxLength(150)
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string;

    @IsOptional()
    @IsPhoneNumber('VN')
    phone?: string;
}