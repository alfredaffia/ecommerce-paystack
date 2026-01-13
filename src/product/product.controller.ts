import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './entity/dto/create-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() productData: CreateProductDto) {
    return this.productService.create(productData);
  }

  @Get()
  async findAll() {
    return this.productService.findAll();
  }
}