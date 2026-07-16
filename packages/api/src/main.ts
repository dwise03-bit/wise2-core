import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  try {
    logger.log('Starting WISE² API initialization...');

    // Validate required environment variables (DATABASE_URL is optional, falls back to DB_* vars)
    const requiredEnvVars = ['JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      process.exit(1);
    }

    const app = await NestFactory.create(AppModule);
    logger.log('NestJS application created successfully');

    // Enable CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    });

    // Global prefix for all routes
    app.setGlobalPrefix('api');

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Swagger / OpenAPI documentation
    // Note: SwaggerModule.setup() mounts its own Express middleware and is NOT
    // affected by app.setGlobalPrefix('api') above, so the full path ('api/docs')
    // must be passed explicitly to land on GET /api/docs (not /docs or /api/api/docs).
    const swaggerConfig = new DocumentBuilder()
      .setTitle('WISE² Enterprise API')
      .setDescription('WISE² platform API documentation')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, swaggerDocument);
    logger.log('Swagger docs available at /api/docs');

    // Use PORT or API_PORT, default to 3001 for Docker
    const port = process.env.PORT || process.env.API_PORT || 3001;
    await app.listen(port);
    logger.log(`WISE² API listening on port ${port}`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    logger.error('Failed to start API server:', error);
    process.exit(1);
  }
}

bootstrap();
