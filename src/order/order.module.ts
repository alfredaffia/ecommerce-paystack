import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderController } from './order.controller';

@Module({
  imports:[TypeOrmModule.forFeature([Order])],
  providers: [OrderService],
  exports:[OrderService],
  controllers: [OrderController]
})
export class OrderModule {}
