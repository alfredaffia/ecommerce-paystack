import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
// import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  // Create NestJS application with logger (removed debug and verbose to reduce noise)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  
  const logger = new Logger('Bootstrap');

  // Enable CORS for frontend integration
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  // Serve static files from 'public' folder
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'public'));
  app.setViewEngine('html');

  // Handle favicon.ico requests to prevent 404 errors in logs
  app.use('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

  // Global exception filter for consistent error responses
  // app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert types automatically
      },
      exceptionFactory: (errors) => {
        // Custom error messages for validation failures
        const messages = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        logger.error(`Validation failed: ${JSON.stringify(messages)}`);
        return new Error(JSON.stringify(messages));
      },
    }),
  );

  // Raw body for webhook signature verification
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  // Swagger API documentation setup
  const config = new DocumentBuilder()
    .setTitle('E-commerce Checkout API')
    .setDescription(
      'Paystack payment integration with NestJS. Features: Product management, Checkout with Paystack, Order tracking, Webhook handling.',
    )
    .setVersion('1.0.0')
    .addTag('Authentication', 'User registration and login endpoints')
    .addTag('Products', 'Product CRUD operations')
    .addTag('Checkout', 'Payment initiation and callbacks')
    .addTag('Orders', 'Order management and tracking')
    .addBearerAuth()
    .setContact(
      'Alfred Affia',
      'https://github.com/alfredaffia/ecommerce-paystack',
      'alfred@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'E-commerce API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api`);
  logger.log(`Paystack webhook endpoint: http://localhost:${port}/checkout/webhook/paystack`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
