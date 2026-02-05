import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CheckoutService {
  private paystack = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  async initiatePayment(dto: { email: string; amount: number; productId: number }) {
    const response = await this.paystack.post('/transaction/initialize', {
      email: dto.email,
      amount: dto.amount * 100, // Paystack uses kobo (smallest unit)
      metadata: {
        productId: dto.productId,
      },
      callback_url: `${process.env.FRONTEND_SUCCESS_URL?.replace('/success.html', '')}/checkout/success`,
    });

    return {
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
      message: 'Payment link generated successfully',
    };
  }
}