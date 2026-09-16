import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'

import { ProductsModule } from './modules/products/products.module'
import { CustomBlendsModule } from './modules/custom-blends/custom-blends.module'
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module'
import { OrdersModule } from './modules/orders/orders.module'
import { AuthModule } from './modules/auth/auth.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'password',
      database: process.env.DATABASE_NAME || 'petals_potions',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-secret-key',
      signOptions: { expiresIn: '24h' },
    }),

    AuthModule,
    ProductsModule,
    CustomBlendsModule,
    SubscriptionsModule,
    OrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
