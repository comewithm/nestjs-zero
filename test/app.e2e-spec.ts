import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth Register (e2e)', () => {
    it('/auth/register (POST) should register a new user', async () => {
      const suffix = Date.now();
      const payload = {
        email: `e2e_${suffix}@example.com`,
        username: `e2e_user_${suffix}`,
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        email: payload.email,
        username: payload.username,
      });
      expect(response.body.password).not.toBe(payload.password);
    });

    it('/auth/register (POST) should return 409 when email already exists', async () => {
      const suffix = Date.now();
      const payload = {
        email: `duplicate_${suffix}@example.com`,
        username: `duplicate_user_${suffix}`,
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...payload,
          username: `another_user_${suffix}`,
        })
        .expect(409);
    });
  });
});
