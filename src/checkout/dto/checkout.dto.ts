import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsPositive, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ 
    example: 'alfred@test.com', 
    description: 'Buyer email address (must be valid email format)',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ 
    example: 5000, 
    description: 'Amount in Naira (minimum 100 Naira)',
    minimum: 100,
  })
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @Min(100, { message: 'Amount must be at least 100 Naira' })
  amount: number;

  @ApiProperty({ 
    example: 1, 
    description: 'Product ID (must be a positive integer)',
  })
  @IsNumber({}, { message: 'Product ID must be a valid number' })
  @IsPositive({ message: 'Product ID must be a positive number' })
  productId: number;

  @ApiProperty({ 
    example: 'ORD-2024-001', 
    description: 'Optional custom reference for your internal tracking (max 100 characters)', 
    required: false,
    maxLength: 100,
  })
  @IsString({ message: 'Reference must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'Reference must not exceed 100 characters' })
  reference?: string;
}