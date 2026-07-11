import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: true,
  })

  // Global prefix for all routes
  app.setGlobalPrefix('api')

  // Start listening
  const port = process.env.API_PORT || 3000
  await app.listen(port)
  console.log(`WISE² API listening on port ${port}`)
}

bootstrap()
