import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { OrderModule } from '../order/order.module';
import { EmailModule } from '../email/email.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [OrderModule, EmailModule,AuthModule],
  providers: [CheckoutService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
