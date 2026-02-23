import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [TypeOrmModule.forFeature([Product]),AuthModule],  // <-- Connect Product entity here
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],  // Optional, good for future use
})
export class ProductModule {}