import { Controller, Get, Patch, Param, Body, UseGuards, Logger, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { OrderService } from '../order/order.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly orderService: OrderService) {}

  @Get('orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all orders (Admin only)',
    description: 'Retrieves all orders from the database. Only accessible by admin users.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all orders',
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  async getAllOrders() {
    this.logger.log('Admin accessing all orders');
    return this.orderService.findAll();
  }

  @Get('orders/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get order by ID (Admin only)',
    description: 'Retrieves a specific order by ID. Only accessible by admin users.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Order ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Order found',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async getOrderById(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Admin accessing order: ${id}`);
    return this.orderService.findOne(id);
  }

  @Patch('orders/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update order status (Admin only)',
    description: 'Updates the status of an order. Only accessible by admin users.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Order ID',
    example: 1,
  })
  @ApiBody({
    type: UpdateOrderStatusDto,
    examples: {
      paid: {
        summary: 'Mark as Paid',
        value: { status: 'paid' },
      },
      failed: {
        summary: 'Mark as Failed',
        value: { status: 'failed' },
      },
      refunded: {
        summary: 'Mark as Refunded',
        value: { status: 'refunded' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    this.logger.log(`Admin updating order ${id} status to: ${updateOrderStatusDto.status}`);
    return this.orderService.updateStatus(id, updateOrderStatusDto.status);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get order statistics (Admin only)',
    description: 'Retrieves order statistics including total orders, revenue, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order statistics',
    schema: {
      example: {
        totalOrders: 150,
        totalRevenue: 7500000,
        paidOrders: 140,
        pendingOrders: 5,
        failedOrders: 5,
      },
    },
  })
  async getStats() {
    this.logger.log('Admin accessing order statistics');
    return this.orderService.getStats();
  }
}
