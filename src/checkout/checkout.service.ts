import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  
  private paystack = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  /**
   * Initiate a payment with Paystack
   * @param dto - Payment details (email, amount, productId, optional reference)
   * @param userId - User ID from authenticated request (links payment to user)
   * @returns Payment authorization URL and reference
   */
  async initiatePayment(
    dto: { email: string; amount: number; productId: number; reference?: string },
    userId?: number,
  ) {
    try {
      // Validate Paystack secret key
      if (!process.env.PAYSTACK_SECRET_KEY) {
        this.logger.error('PAYSTACK_SECRET_KEY not configured');
        throw new InternalServerErrorException('Payment service not configured');
      }

      // Validate callback URL
      if (!process.env.FRONTEND_SUCCESS_URL) {
        this.logger.error('FRONTEND_SUCCESS_URL not configured');
        throw new InternalServerErrorException('Payment callback not configured');
      }

      // Prepare callback URL (point to NestJS endpoint, not static HTML)
      const callbackUrl = `${process.env.FRONTEND_SUCCESS_URL?.replace('/success.html', '')}/checkout/success`;

      this.logger.log(`Initiating Paystack payment: ${dto.email} - ₦${dto.amount}${userId ? ` (User: ${userId})` : ''}`);

      // Call Paystack API with userId in metadata
      const response = await this.paystack.post('/transaction/initialize', {
        email: dto.email,
        amount: dto.amount * 100, // Convert Naira to kobo (Paystack uses smallest currency unit)
        metadata: {
          productId: dto.productId,
          custom_reference: dto.reference,
          userId, // Include userId in metadata for webhook processing
        },
        callback_url: callbackUrl,
      });

      this.logger.log(`Paystack payment initialized: ${response.data.data.reference}${userId ? ` (User: ${userId})` : ''}`);

      return {
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
        access_code: response.data.data.access_code,
        message: 'Payment link generated successfully',
      };
    } catch (error) {
      // Handle Axios errors from Paystack API
      if (error instanceof AxiosError) {
        const paystackError = error.response?.data;
        this.logger.error(`Paystack API error: ${JSON.stringify(paystackError)}`);

        throw new BadRequestException(
          paystackError?.message || 'Failed to initiate payment with Paystack',
        );
      }

      // Handle other errors
      this.logger.error(`Payment initiation failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to initiate payment');
    }
  }
}