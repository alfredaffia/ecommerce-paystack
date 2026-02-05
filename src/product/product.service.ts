import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './entity/dto/create-product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * Create a new product
   * @param productData - Product details from DTO
   * @returns Created product entity
   */
  async create(productData: CreateProductDto): Promise<Product> {
    try {
      const product = this.productRepository.create(productData);
      const savedProduct = await this.productRepository.save(product);
      this.logger.log(`Product created: ${savedProduct.id} - ${savedProduct.name}`);
      return savedProduct;
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all products
   * @returns Array of all products
   */
  async findAll(): Promise<Product[]> {
    try {
      return await this.productRepository.find({
        order: { id: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch products: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find a product by ID
   * @param id - Product ID
   * @returns Product entity or null if not found
   */
  async findOne(id: number): Promise<Product | null> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        this.logger.warn(`Product not found: ${id}`);
      }
      return product;
    } catch (error) {
      this.logger.error(`Failed to fetch product ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}