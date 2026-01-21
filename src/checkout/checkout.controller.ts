import { Controller, Post, Body } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
}