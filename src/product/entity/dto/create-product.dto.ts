import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Dell XPS 13', description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 250000.00, description: 'Price in Naira' })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'High-performance laptop', description: 'Product description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}