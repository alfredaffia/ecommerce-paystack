import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsPositive, MinLength, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ 
    example: 'Dell XPS 13', 
    description: 'Product name (3-100 characters)',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'Product name must be a string' })
  @MinLength(3, { message: 'Product name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Product name must not exceed 100 characters' })
  name: string;

  @ApiProperty({ 
    example: 250000.00, 
    description: 'Price in Naira (must be positive)',
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Price must be a valid number' })
  @IsPositive({ message: 'Price must be a positive number' })
  @Min(0.01, { message: 'Price must be at least 0.01 Naira' })
  price: number;

  @ApiProperty({ 
    example: 'High-performance laptop with 16GB RAM and 512GB SSD', 
    description: 'Product description (optional, max 500 characters)', 
    required: false,
    maxLength: 500,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}