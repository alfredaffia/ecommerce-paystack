import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { Product } from './product/entity/product.entity';
import { CheckoutService } from './checkout/checkout.service';
import { CheckoutModule } from './checkout/checkout.module';
import { Order } from './order/entity/order.entity';
import { OrderModule } from './order/order.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entities/user.entity';

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
        entities: [User,Product, Order],
        synchronize: configService.get('NODE_ENV') !== 'production', // Only sync in development
        logging: configService.get('NODE_ENV') === 'development',
        ssl:true,
        extra:{
        ssl:  {
          rejectUnauthorized: false,
        } }
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    ProductModule,
    CheckoutModule,
    OrderModule,
    HealthModule,
  ],
  providers: [CheckoutService],
  controllers: [],
})
export class AppModule {}
