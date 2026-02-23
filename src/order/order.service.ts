import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  /**
   * Create an order from webhook data
   * Called when Paystack sends a charge.success webhook
   * @param reference - Payment reference from Paystack
   * @param amount - Amount in Naira
   * @param email - Customer email
   * @param status - Order status (usually 'paid')
   * @param productId - Optional product ID from metadata
   * @param userId - Optional user ID from metadata (links order to user)
   * @returns Created order entity
   */
  async createFromWebhook(
    reference: string,
    amount: number,
    email: string,
    status: string,
    productId?: number,
    userId?: number,
  ): Promise<Order> {
    try {
      // Check if order already exists (prevent duplicates)
      const existingOrder = await this.orderRepository.findOne({
        where: { reference },
      });

      if (existingOrder) {
        this.logger.warn(`Order with reference ${reference} already exists`);
        return existingOrder;
      }

      // Create new order
      const order = this.orderRepository.create({
        reference,
        amount,
        email,
        status: 'paid',
        productId,
        userId, // Link to user if provided
      });

      const savedOrder = await this.orderRepository.save(order);
      this.logger.log(
        `Order created from webhook: ${savedOrder.id} - ${reference}${userId ? ` (User: ${userId})` : ''}`,
      );

      return savedOrder;
    } catch (error) {
      this.logger.error(`Failed to create order from webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all orders (admin only)
   * @returns Array of all orders, sorted by creation date (newest first)
   */
  async findAll(): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        order: { createdAt: 'DESC' }, // newest first
        relations: ['user'], // Include user information
      });
    } catch (error) {
      this.logger.error(`Failed to fetch orders: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get orders for a specific user
   * @param userId - User ID
   * @returns Array of user's orders
   */
  async findByUserId(userId: number): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        relations: ['user'],
      });
    } catch (error) {
      this.logger.error(`Failed to fetch orders for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find an order by ID
   * @param id - Order ID
   * @returns Order entity
   */
  async findOne(id: number): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      return order;
    } catch (error) {
      this.logger.error(`Failed to fetch order ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update order status
   * @param id - Order ID
   * @param status - New status
   * @returns Updated order
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    try {
      const order = await this.findOne(id);
      order.status = status;
      const updatedOrder = await this.orderRepository.save(order);
      this.logger.log(`Order ${id} status updated to: ${status}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to update order ${id} status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get order statistics
   * @returns Order statistics
   */
  async getStats() {
    try {
      const [orders, totalOrders] = await this.orderRepository.findAndCount();
      
      const totalRevenue = orders.reduce((sum, order) => {
        return order.status === 'paid' ? sum + Number(order.amount) : sum;
      }, 0);

      const paidOrders = orders.filter(o => o.status === 'paid').length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const failedOrders = orders.filter(o => o.status === 'failed').length;

      return {
        totalOrders,
        totalRevenue,
        paidOrders,
        pendingOrders,
        failedOrders,
      };
    } catch (error) {
      this.logger.error(`Failed to get order stats: ${error.message}`, error.stack);
      throw error;
    }
  }
}
