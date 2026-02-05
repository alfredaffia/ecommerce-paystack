import { Injectable, Logger } from '@nestjs/common';
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
   * @returns Created order entity
   */
  async createFromWebhook(
    reference: string,
    amount: number,
    email: string,
    status: string,
    productId?: number,
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
      });

      const savedOrder = await this.orderRepository.save(order);
      this.logger.log(`Order created from webhook: ${savedOrder.id} - ${reference}`);
      
      return savedOrder;
    } catch (error) {
      this.logger.error(`Failed to create order from webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all orders
   * @returns Array of all orders, sorted by creation date (newest first)
   */
  async findAll(): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        order: { createdAt: 'DESC' }, // newest first
      });
    } catch (error) {
      this.logger.error(`Failed to fetch orders: ${error.message}`, error.stack);
      throw error;
    }
  }
}
