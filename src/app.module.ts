import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { Product } from './product/entity/product.entity';
// import { CheckoutModule } from './checkout/checkout.module';
import { CheckoutService } from './checkout/checkout.service';
import { CheckoutModule } from './checkout/checkout.module';
import { Order } from './order/entity/order.entity';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL'),
    entities: [Product,Order],
    synchronize: true,
    logging: true,
    ssl: true,                    
    extra: {
      ssl: {
        rejectUnauthorized: false  
      }
    }
  }),
  inject: [ConfigService],
}),

    ProductModule,

    CheckoutModule,

    OrderModule,
  ],
  providers: [CheckoutService],
})
export class AppModule {}