import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
export class LoginDTO {
    @IsEmail()
    @MaxLength(150)
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string;
}