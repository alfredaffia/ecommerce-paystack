import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Product])],  // <-- Connect Product entity here
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],  // Optional, good for future use
})
export class ProductModule {}