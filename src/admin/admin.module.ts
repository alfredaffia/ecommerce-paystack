import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { OrderModule } from '../order/order.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [OrderModule, AuthModule],
  controllers: [AdminController],
})
export class AdminModule {}
