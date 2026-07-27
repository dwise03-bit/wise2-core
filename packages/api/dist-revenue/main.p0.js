"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_p0_1 = require("./app.module.p0");
const logger = new common_1.Logger('Bootstrap');
async function bootstrap() {
    try {
        logger.log('Starting WISE² P0 Revenue API...');
        const app = await core_1.NestFactory.create(app_module_p0_1.AppModule);
        logger.log('NestJS application created successfully');
        // Enable CORS
        app.enableCors({
            origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
            credentials: true,
        });
        // Global prefix for all routes
        app.setGlobalPrefix('api');
        // Global validation pipe
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        // Swagger documentation
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('WISE² Revenue API (P0)')
            .setDescription('P0 revenue endpoints: Health, Prospects, Billing, Stripe')
            .setVersion('1.0.0')
            .addBearerAuth()
            .build();
        const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('api/docs', app, swaggerDocument);
        logger.log('Swagger docs available at /api/docs');
        // Start on P0 port
        const port = process.env.PORT || process.env.API_PORT || 3001;
        await app.listen(port);
        logger.log(`WISE² P0 Revenue API listening on port ${port}`);
        logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    }
    catch (error) {
        logger.error('Failed to start API server:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.p0.js.map