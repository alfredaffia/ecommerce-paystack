import { Controller, Post, Body, Get, Query, Res, Req, Headers, HttpStatus } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';


@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('pay')
  @ApiOperation({ summary: 'Initiate a payment with Paystack' })
  @ApiResponse({ status: 201, description: 'Payment link generated' })
  async initiatePayment(@Body() checkoutDto: CheckoutDto) {
    return this.checkoutService.initiatePayment(checkoutDto);
  }

  @Get('success')
  @ApiOperation({ summary: 'Paystack success callback' })
  async paymentSuccess(@Query('reference') reference: string, @Query('trxref') trxref: string) {
    // In real app: verify payment with Paystack using reference
    return {
      message: 'Payment successful!',
      reference,
      trxref,
      status: 'success',
    };
  }

   @Post('webhook/paystack')
  handlePaystackWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Check if secret exists
    if (!secret) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Missing secret key');
    }

    // Check if request body exists
    if (!req.body) {
      return res.status(HttpStatus.BAD_REQUEST).send('Missing request body');
    }

    // 1. Verify webhook (VERY IMPORTANT)
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      return res.status(HttpStatus.UNAUTHORIZED).send('Invalid signature');
    }

    // 2. Handle event
    if (req.body.event === 'charge.success') {
      const data = req.body.data;

      const reference = data.reference;
      const amount = data.amount;
      const email = data.customer.email;

      // TODO: update order / payment in DB
      console.log('Payment success:', reference, amount, email);
    }

    // 3. Always return 200
    return res.status(HttpStatus.OK).send('OK');
  }
}


// so this is it i just want to reduce the height of the footer bring down the signatory part too
// make the current footer half the size