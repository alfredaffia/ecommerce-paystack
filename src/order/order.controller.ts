import { Controller, Get, Logger, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Order } from './entity/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Get()
  @UseGuards(JwtAuthGuard) // Protect endpoint - requires authentication
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my orders',
    description: 'Retrieves all orders for the currently logged-in user, sorted by creation date (newest first).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
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
          userId: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  async getMyOrders(@Req() req: Request): Promise<Order[]> {
    const userId = (req.user as any).id; // Extract user ID from JWT token
    this.logger.log(`Fetching orders for user ${userId}`);

    try {
      const orders = await this.orderService.findByUserId(userId);
      this.logger.log(`Retrieved ${orders.length} orders for user ${userId}`);
      return orders;
    } catch (error) {
      this.logger.error(`Failed to fetch orders for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}