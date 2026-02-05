import { Controller, Post, Body, Get, Query, Res, Req, Headers, HttpStatus, Param } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';
import { OrderService } from 'src/order/order.service';
import axios from 'axios';


@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService,
    private readonly orderService: OrderService
  ) { }

  @Post('pay')
  @ApiOperation({ summary: 'Initiate a payment with Paystack' })
  @ApiResponse({ status: 201, description: 'Payment link generated' })
  async initiatePayment(@Body() checkoutDto: CheckoutDto) {
    return this.checkoutService.initiatePayment(checkoutDto);
  }

  @Get('test-verify/:reference')
  @ApiOperation({ summary: 'Test payment verification' })
  async testVerification(@Param('reference') reference: string) {
    try {
      console.log('Testing verification for reference:', reference);
      
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
      return {
        success: false,
        error: error.message,
        response: error.response?.data,
      };
    }
  }
@Get('success')
async paymentSuccess(
  @Query('reference') reference: string,
  @Query('trxref') trxref: string,
  @Res() res: Response,
) {
  const ref = reference || trxref;

  console.log('=== SUCCESS ENDPOINT HIT ===');
  console.log('Reference from query:', ref);
  console.log('All query params:', JSON.stringify(Object.fromEntries(new URLSearchParams(res.req.url.split('?')[1] || ''))));

  if (!ref) {
    console.log('No reference found, redirecting with N/A');
    return res.redirect(`/success.html?reference=N/A&amount=N/A`);
  }

  let amountNaira: string | number = 'N/A';

  try {
    console.log('Verifying payment with Paystack for reference:', ref);
    console.log('Using secret key:', process.env.PAYSTACK_SECRET_KEY ? 'Present' : 'Missing');

    const verification = await axios.get(
      `https://api.paystack.co/transaction/verify/${ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    console.log('Paystack API response status:', verification.status);
    console.log('Paystack API response data:', JSON.stringify(verification.data, null, 2));

    const data = verification.data.data;

    if (verification.data.status && data.status === 'success') {
      const amountInKobo = data.amount;
      amountNaira = amountInKobo / 100; // Convert kobo to Naira
      console.log('Payment verified successfully!');
      console.log('Amount in kobo:', amountInKobo);
      console.log('Amount in Naira:', amountNaira);
    } else {
      console.log('Payment verification failed or status not success');
      console.log('Verification status:', verification.data.status);
      console.log('Transaction status:', data?.status);
    }
  } catch (error) {
    console.error('=== VERIFICATION ERROR ===');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('Full error:', error);
  }

  console.log('Final amount to redirect:', amountNaira);
  
  // Redirect with params (for HTML to read)
  const redirectUrl = `/success.html?reference=${encodeURIComponent(ref)}&amount=${encodeURIComponent(amountNaira.toString())}`;
  console.log('Redirecting to:', redirectUrl);
  
  res.redirect(redirectUrl);
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
      const amountKobo = data.amount;          
      const amountNaira = amountKobo / 100;
      const email = data.customer.email;
      const productId = data.metadata?.productId;

      // TODO: update order / payment in DB
      console.log('Payment success:', reference, amountNaira, email);
      this.orderService.createFromWebhook(reference, amountNaira, email, 'paid', productId);
    }

    // 3. Always return 200
    return res.status(HttpStatus.OK).send('OK');
  }
}


// so this is it i just want to reduce the height of the footer bring down the signatory part too
// make the current footer half the size