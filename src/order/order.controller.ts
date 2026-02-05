import { Controller, Get, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Order } from './entity/order.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all orders',
    description: 'Retrieves all orders from the database, sorted by creation date (newest first).',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all orders',
    type: [Order],
    schema: {
      example: [
        {
          id: 1,
          reference: 'xyz789',
          amount: 5000,
          email: 'customer@example.com',
          status: 'paid',
          productId: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  async findAll(): Promise<Order[]> {
    this.logger.log('Fetching all orders');
    try {
      const orders = await this.orderService.findAll();
      this.logger.log(`Retrieved ${orders.length} orders`);
      return orders;
    } catch (error) {
      this.logger.error(`Failed to fetch orders: ${error.message}`, error.stack);
      throw error;
    }
  }
}