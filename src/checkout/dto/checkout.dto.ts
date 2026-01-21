import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: 'alfred@test.com', description: 'Buyer email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 500000, description: 'Amount in Naira' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty({ example: 'Optional reference', description: 'Your internal order reference', required: false })
  @IsString()
  @IsOptional()
  reference?: string;
}