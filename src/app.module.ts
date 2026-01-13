import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { Product } from './product/entity/product.entity';
// import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [
    // Load .env file globally
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigService available everywhere
      envFilePath: '.env',
    }),

    // TypeORM – all config from .env via ConfigService
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: configService.get<string>('DB_HOST'),
    //     port: configService.get<number>('DB_PORT'),
    //     username: configService.get<string>('DB_USERNAME'),
    //     password: configService.get<string>('DB_PASSWORD'),
    //     database: configService.get<string>('DB_DATABASE'),
    //     entities: [Product], // add more entities later
    //     synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true), // true only in dev!
    //     logging: true, // shows SQL queries – helpful for debugging
    //   }),
    //   inject: [ConfigService],
      
    // }),
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL'),
    entities: [Product],
    synchronize: true,
    logging: true,
    ssl: true,                    // <-- Force SSL
    extra: {
      ssl: {
        rejectUnauthorized: false  // <-- Accept self-signed cert (common with hosted DBs)
      }
    }
  }),
  inject: [ConfigService],
}),

    ProductModule,
  ],
})
export class AppModule {}