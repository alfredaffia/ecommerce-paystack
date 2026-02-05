import { Controller, Get, Post, Body, HttpCode, HttpStatus, Logger, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './entity/dto/create-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new product',
    description: 'Creates a new product in the database. All fields are validated.',
  })
  @ApiBody({ 
    type: CreateProductDto,
    description: 'Product details',
    examples: {
      laptop: {
        summary: 'Laptop Example',
        value: {
          name: 'Dell XPS 13',
          price: 250000,
          description: 'High-performance laptop with 16GB RAM and 512GB SSD',
        },
      },
      phone: {
        summary: 'Phone Example',
        value: {
          name: 'iPhone 15 Pro',
          price: 450000,
          description: 'Latest iPhone with A17 Pro chip',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Product created successfully',
    type: Product,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed',
    schema: {
      example: {
        statusCode: 400,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/products',
        method: 'POST',
        error: 'Bad Request',
        message: [
          {
            field: 'price',
            errors: ['Price must be a positive number'],
          },
        ],
      },
    },
  })
  async create(@Body() productData: CreateProductDto): Promise<Product> {
    this.logger.log(`Creating new product: ${productData.name}`);
    try {
      const product = await this.productService.create(productData);
      this.logger.log(`Product created successfully with ID: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all products',
    description: 'Retrieves a list of all products in the database.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of products retrieved successfully',
    type: [Product],
    schema: {
      example: [
        {
          id: 1,
          name: 'Dell XPS 13',
          price: 250000,
          description: 'High-performance laptop',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          name: 'iPhone 15 Pro',
          price: 450000,
          description: 'Latest iPhone',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  async findAll(): Promise<Product[]> {
    this.logger.log('Fetching all products');
    try {
      const products = await this.productService.findAll();
      this.logger.log(`Retrieved ${products.length} products`);
      return products;
    } catch (error) {
      this.logger.error(`Failed to fetch products: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get a product by ID',
    description: 'Retrieves a single product by its ID.',
  })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'Product ID',
    example: 1,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Product found',
    type: Product,
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Product not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    this.logger.log(`Fetching product with ID: ${id}`);
    try {
      const product = await this.productService.findOne(id);
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      this.logger.error(`Failed to fetch product ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}