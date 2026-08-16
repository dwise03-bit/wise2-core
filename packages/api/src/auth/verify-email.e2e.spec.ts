import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { EmailVerificationToken } from './email-verification-token.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as crypto from 'crypto';

describe('Email Verification E2E Tests - POST /api/v1/auth/verify-email', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let tokenRepository: Repository<EmailVerificationToken>;
  let testUser: User;
  let testEmail: string;
  let testPassword = 'SecureTest@2024Pass';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    tokenRepository = moduleFixture.get<Repository<EmailVerificationToken>>(
      getRepositoryToken(EmailVerificationToken),
    );

    testEmail = `verify-email-test-${Date.now()}@example.com`;
  }, 30000); // Increase timeout for app initialization

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Setup: User Registration', () => {
    it('should create unverified user for testing', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Verify',
          lastName: 'Test',
        })
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testEmail);
      testUser = response.body.user;

      const dbUser = await userRepository.findOneBy({ id: testUser.id });
      expect(dbUser).toBeDefined();
      expect(dbUser!.email_verified).toBe(false);
    });
  });

  describe('1. Valid Email Verification', () => {
    let validToken: string;
    let validTokenHash: string;

    beforeAll(async () => {
      const token = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const verificationToken = tokenRepository.create({
        userId: testUser.id,
        token_hash: hash,
        expires_at: expiresAt,
      });

      await tokenRepository.save(verificationToken);
      validToken = token;
      validTokenHash = hash;
    });

    it('should successfully verify email with valid token', async () => {
      const tokenToSend = `${testUser.id}:${validTokenHash}`;

      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: tokenToSend,
        })
        .expect(200);

      expect(response.body.message).toBe('Email verified successfully');
    });

    it('should update user email_verified status to true', async () => {
      const dbUser = await userRepository.findOneBy({ id: testUser.id });
      expect(dbUser!.email_verified).toBe(true);
    });

    it('should mark token as verified in database', async () => {
      const dbToken = await tokenRepository.findOneBy({
        token_hash: validTokenHash,
      });

      expect(dbToken).toBeDefined();
      expect(dbToken!.verified_at).toBeDefined();
      expect(dbToken!.verified_at).toBeInstanceOf(Date);
    });

    it('should allow login after email verification', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe(testEmail);
      expect(response.body.expiresIn).toBe(900);
    });
  });

  describe('2. Invalid Token Format', () => {
    it('should reject token without colon separator', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: 'invalidsingleparttoken',
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid verification token format');
    });

    it('should reject token with too many parts', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: 'part1:part2:part3',
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid verification token format');
    });

    it('should reject empty token', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: '',
        });

      expect([400, 404]).toContain(response.status);
    });

    it('should reject missing token', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({});

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('3. Invalid Token Hash', () => {
    it('should reject token with non-existent hash', async () => {
      const fakeHash = crypto.randomBytes(32).toString('hex');

      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: `${testUser.id}:${fakeHash}`,
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should reject malformed hash', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: `${testUser.id}:notahash`,
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid or expired');
    });
  });

  describe('4. Non-Existent User', () => {
    it('should reject token with non-existent user ID', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      const fakeHash = crypto.randomBytes(32).toString('hex');

      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: `${fakeUserId}:${fakeHash}`,
        })
        .expect(404);

      expect(response.body.message).toContain('User not found');
    });
  });

  describe('5. One-Time Use Enforcement', () => {
    let oneTimeTestUser: User;
    let oneTimeToken: string;

    beforeAll(async () => {
      const email = `onetime-test-${Date.now()}@example.com`;
      const signupResponse = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({
          email,
          password: testPassword,
          firstName: 'OneTime',
          lastName: 'Test',
        });

      oneTimeTestUser = signupResponse.body.user;

      const token = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const verificationToken = tokenRepository.create({
        userId: oneTimeTestUser.id,
        token_hash: hash,
        expires_at: expiresAt,
      });

      await tokenRepository.save(verificationToken);
      oneTimeToken = `${oneTimeTestUser.id}:${hash}`;
    });

    it('should verify email on first use', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: oneTimeToken,
        })
        .expect(200);

      expect(response.body.message).toBe('Email verified successfully');
    });

    it('should reject same token on second attempt', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: oneTimeToken,
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid or expired');
    });
  });

  describe('6. Expired Token Handling', () => {
    let expiredTestUser: User;
    let expiredTokenHash: string;

    beforeAll(async () => {
      const email = `expired-test-${Date.now()}@example.com`;
      const signupResponse = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({
          email,
          password: testPassword,
          firstName: 'Expired',
          lastName: 'Test',
        });

      expiredTestUser = signupResponse.body.user;

      const token = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const expiredTime = new Date(Date.now() - 1000);

      const verificationToken = tokenRepository.create({
        userId: expiredTestUser.id,
        token_hash: hash,
        expires_at: expiredTime,
      });

      await tokenRepository.save(verificationToken);
      expiredTokenHash = hash;
    });

    it('should reject expired verification token', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: `${expiredTestUser.id}:${expiredTokenHash}`,
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should not verify email for expired token', async () => {
      const dbUser = await userRepository.findOneBy({ id: expiredTestUser.id });
      expect(dbUser!.email_verified).toBe(false);
    });
  });

  describe('7. Response Format', () => {
    it('should return HTTP 200 on success', async () => {
      const email = `response-test-${Date.now()}@example.com`;
      const signupResponse = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({
          email,
          password: testPassword,
        });

      const userId = signupResponse.body.user.id;

      const token = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const verificationToken = tokenRepository.create({
        userId,
        token_hash: hash,
        expires_at: expiresAt,
      });

      await tokenRepository.save(verificationToken);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: `${userId}:${hash}`,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });

    it('should return 400 for invalid token format', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: 'invalid',
        });

      expect([400, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: '00000000-0000-0000-0000-000000000000:' + 'a'.repeat(64),
        });

      expect(response.status).toBe(404);
    });
  });

  describe('8. Security - No Sensitive Data in Response', () => {
    it('should not return token in success response', async () => {
      const email = `security-test-${Date.now()}@example.com`;
      const signupResponse = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({
          email,
          password: testPassword,
          firstName: 'Security',
          lastName: 'Test',
        });

      const userId = signupResponse.body.user.id;

      const token = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const verificationToken = tokenRepository.create({
        userId,
        token_hash: hash,
        expires_at: expiresAt,
      });

      await tokenRepository.save(verificationToken);

      const verifyResponse = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: `${userId}:${hash}`,
        })
        .expect(200);

      expect(verifyResponse.body.token).toBeUndefined();
      expect(verifyResponse.body.tokenHash).toBeUndefined();
      expect(JSON.stringify(verifyResponse.body)).not.toContain(hash);
    });

    it('should not return user password in error response', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: 'invalid-token',
        });

      expect(response.body.password).toBeUndefined();
      expect(response.body.password_hash).toBeUndefined();
    });
  });

  describe('9. Complete Auth Flow', () => {
    it('should not allow login before email verification', async () => {
      const email = `no-verify-test-${Date.now()}@example.com`;

      await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({
          email,
          password: testPassword,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email,
          password: testPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email');
    });

    it('complete flow: signup -> verify -> login', async () => {
      const email = `complete-flow-${Date.now()}@example.com`;

      const signupResponse = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({
          email,
          password: testPassword,
          firstName: 'Complete',
          lastName: 'Flow',
        })
        .expect(201);

      const userId = signupResponse.body.user.id;

      const token = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const verificationToken = tokenRepository.create({
        userId,
        token_hash: hash,
        expires_at: expiresAt,
      });

      await tokenRepository.save(verificationToken);

      const verifyResponse = await request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .send({
          token: `${userId}:${hash}`,
        })
        .expect(200);

      expect(verifyResponse.body.message).toBe('Email verified successfully');

      const loginResponse = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email,
          password: testPassword,
        })
        .expect(200);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.body.refreshToken).toBeDefined();
      expect(loginResponse.body.user.email).toBe(email);
    });
  });
});
