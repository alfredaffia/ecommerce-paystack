import { Controller, Post, Body, Get, Query, Res, Req, Headers, HttpStatus, Param, HttpCode, Logger, BadRequestException, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiHeader, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';
import { OrderService } from '../order/order.service';
import { EmailService } from '../email/email.service';
import axios from 'axios';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);

  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly orderService: OrderService,
    private readonly emailService: EmailService,
  ) { }

  @UseGuards(JwtAuthGuard) // Protect endpoint - requires authentication
  @ApiBearerAuth()
  @Post('pay')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate a payment with Paystack (Protected)',
    description: 'Creates a Paystack payment link for the authenticated user. Requires JWT token. Returns authorization URL and reference.',
  })
  @ApiBody({
    type: CheckoutDto,
    examples: {
      example1: {
        summary: 'Sample Payment',
        value: {
          email: 'customer@example.com',
          amount: 5000,
          productId: 1,
          reference: 'ORD-2024-001',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment link generated successfully',
    schema: {
      example: {
        authorization_url: 'https://checkout.paystack.com/abc123',
        reference: 'xyz789',
        message: 'Payment link generated successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to initiate payment with Paystack',
  })
  async initiatePayment(@Body() checkoutDto: CheckoutDto, @Req() req: Request) {
    const userId = (req.user as any).id; // Extract user ID from JWT token
    this.logger.log(`Initiating payment for user ${userId} - ${checkoutDto.email} - Amount: ₦${checkoutDto.amount}`);

    try {
      // Pass userId to service to include in Paystack metadata
      const result = await this.checkoutService.initiatePayment(checkoutDto, userId);
      this.logger.log(`Payment initiated successfully for user ${userId}. Reference: ${result.reference}`);
      return result;
    } catch (error) {
      this.logger.error(`Payment initiation failed for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('test-verify/:reference')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test payment verification',
    description: 'Test endpoint to verify a payment with Paystack API. Useful for debugging.',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification result',
  })
  async testVerification(@Param('reference') reference: string) {
    this.logger.log(`Testing verification for reference: ${reference}`);
    try {
      const verification = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );

      return {
        success: true,
        data: verification.data,
        amount_kobo: verification.data.data.amount,
        amount_naira: verification.data.data.amount / 100,
      };
    } catch (error) {
      this.logger.error(`Verification test failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        response: error.response?.data,
      };
    }
  }

  @Get('success')
  @ApiOperation({
    summary: 'Paystack success callback',
    description: 'Callback endpoint after successful payment. Verifies payment with Paystack and redirects to success page.',
  })
  @ApiQuery({
    name: 'reference',
    required: false,
    description: 'Payment reference from Paystack',
    example: 'xyz789',
  })
  @ApiQuery({
    name: 'trxref',
    required: false,
    description: 'Alternative transaction reference',
    example: 'xyz789',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to success.html with payment details',
  })
  async paymentSuccess(
    @Query('reference') reference: string,
    @Query('trxref') trxref: string,
    @Res() res: Response,
  ) {
    const ref = reference || trxref;

    this.logger.log('=== SUCCESS ENDPOINT HIT ===');
    this.logger.log(`Reference from query: ${ref}`);

    if (!ref) {
      this.logger.warn('No reference found in success callback');
      return res.redirect(`/success.html?reference=N/A&amount=N/A`);
    }

    let amountNaira: string | number = 'N/A';

    try {
      this.logger.log(`Verifying payment with Paystack for reference: ${ref}`);

      const verification = await axios.get(
        `https://api.paystack.co/transaction/verify/${ref}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );

      this.logger.log(`Paystack API response status: ${verification.status}`);

      const data = verification.data.data;

      if (verification.data.status && data.status === 'success') {
        const amountInKobo = data.amount;
        amountNaira = amountInKobo / 100; // Convert kobo to Naira
        this.logger.log(`Payment verified successfully! Amount: ₦${amountNaira}`);
      } else {
        this.logger.warn(`Payment verification failed. Status: ${data?.status}`);
      }
    } catch (error) {
      this.logger.error('=== VERIFICATION ERROR ===');
      this.logger.error(`Error: ${error.message}`);
      if (error.response) {
        this.logger.error(`Paystack error: ${JSON.stringify(error.response.data)}`);
      }
    }

    const redirectUrl = `/success.html?reference=${encodeURIComponent(ref)}&amount=${encodeURIComponent(amountNaira.toString())}`;
    this.logger.log(`Redirecting to: ${redirectUrl}`);

    res.redirect(redirectUrl);
  }

  @Post('webhook/paystack')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Paystack webhook handler',
    description: 'Receives and processes webhook events from Paystack. Verifies signature and creates orders on successful payments.',
  })
  @ApiHeader({
    name: 'x-paystack-signature',
    description: 'Paystack webhook signature for verification',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid signature',
  })
  @ApiResponse({
    status: 400,
    description: 'Missing request body',
  })
  handlePaystackWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-paystack-signature') signature: string,
  ) {
    // this.logger.log('=== WEBHOOK RECEIVED ===');

    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Check if secret exists
    if (!secret) {
      // this.logger.error('PAYSTACK_SECRET_KEY not configured');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Missing secret key');
    }

    // Check if request body exists
    if (!req.body) {
      // this.logger.error('Webhook received with no body');
      return res.status(HttpStatus.BAD_REQUEST).send('Missing request body');
    }

    try {
      // 1. Verify webhook signature (VERY IMPORTANT for security)
      const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== signature) {
        // this.logger.error('Invalid webhook signature');
        return res.status(HttpStatus.UNAUTHORIZED).send('Invalid signature');
      }

      // this.logger.log('Webhook signature verified ✓');

      // 2. Handle event
      if (req.body.event === 'charge.success') {
        const data = req.body.data;

        const reference = data.reference;
        const amountKobo = data.amount;
        const amountNaira = amountKobo / 100;
        const email = data.customer.email;
        const productId = data.metadata?.productId;
        const userId = data.metadata?.userId; // Extract userId from metadata

        this.logger.log(`Payment success: ${reference} - ₦${amountNaira} - ${email}${userId ? ` (User: ${userId})` : ''}`);

        // Save order to database with userId
        this.orderService
          .createFromWebhook(reference, amountNaira, email, 'paid', productId, userId)
          .then((order) => {
            this.logger.log(`Order created: ID ${order.id}${userId ? ` (User: ${userId})` : ''}`);

            // Send order confirmation email (don't await - run in background)
            this.emailService.sendOrderConfirmation(order)
              .then(() => {
                this.logger.log(`Order confirmation email sent for: ${order.reference}`);
              })
              .catch((error) => {
                this.logger.error(`Failed to send order confirmation email: ${error.message}`);
              });

            // Send payment receipt email (don't await - run in background)
            this.emailService.sendPaymentReceipt(order)
              .then(() => {
                this.logger.log(`Payment receipt email sent for: ${order.reference}`);
              })
              .catch((error) => {
                this.logger.error(`Failed to send payment receipt email: ${error.message}`);
              });
          })
          .catch((error) => {
            this.logger.error(`Failed to create order: ${error.message}`, error.stack);
          });
      } else {
        this.logger.log(`Webhoo/k event received: ${req.body.event}`);
      }

      // 3. Always return 200 to acknowledge receipt
      return res.status(HttpStatus.OK).send('OK');
    } catch (error) {
      // this.logger.error(`Webhook processing error: ${error.message}`, error.stack);
      // Still return 200 to prevent Paystack from retrying
      return res.status(HttpStatus.OK).send('OK');
    }
  }
}