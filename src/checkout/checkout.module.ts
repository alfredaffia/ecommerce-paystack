import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { OrderService } from 'src/order/order.service';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports:[OrderModule],
  providers: [CheckoutService],
  controllers: [CheckoutController]
})
export class CheckoutModule {}
