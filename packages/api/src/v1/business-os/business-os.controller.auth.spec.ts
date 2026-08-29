import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import * as request from 'supertest';
import { AuthModule } from '../../auth/auth.module';
import { BusinessOsModule } from './business-os.module';

describe('BusinessOsController auth', () => {
  let app: INestApplication;
  const jwtSecret = 'business-os-auth-test-secret';

  beforeAll(async () => {
    process.env.JWT_SECRET = jwtSecret;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        BusinessOsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  function authHeader() {
    const token = jwt.sign(
      { sub: 'user-business-os', email: 'operator@wise2.net', role: 'FOUNDER' },
      jwtSecret,
      { expiresIn: '1h' },
    );
    return `Bearer ${token}`;
  }

  it('GET /api/v1/business-os/dashboard returns 401 without JWT', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/business-os/dashboard')
      .expect(401);
  });

  it('POST /api/v1/business-os/command returns 401 without JWT', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/business-os/command')
      .send({ text: 'show hot leads' })
      .expect(401);
  });

  it('POST /api/v1/business-os/command rejects shell capability when authenticated', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/business-os/command')
      .set('Authorization', authHeader())
      .send({ text: 'run shell on prod' })
      .expect(400);

    expect(response.body.message).toContain('Blocked capability');
  });

  it('POST /api/v1/business-os/command accepts allowlisted command when authenticated', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/business-os/command')
      .set('Authorization', authHeader())
      .send({ text: 'show hot leads' })
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'completed',
      message: 'Command accepted',
      result: {
        module: 'crm',
      },
    });
    expect(typeof response.body.operationId).toBe('string');
  });

  it('GET /api/v1/business-os/dashboard returns contract when authenticated', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/business-os/dashboard')
      .set('Authorization', authHeader())
      .expect(200);

    expect(response.body).toEqual({
      revenueToday: 0,
      revenueMonth: 0,
      hotLeadCount: 0,
      activeJobCount: 0,
      unpaidInvoiceCount: 0,
      criticalAlertCount: 0,
    });
  });
});
