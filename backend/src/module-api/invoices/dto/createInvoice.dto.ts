import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;
}