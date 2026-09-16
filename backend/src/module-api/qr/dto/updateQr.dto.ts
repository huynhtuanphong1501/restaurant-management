import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class UpdateQrCodeDto {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}