import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';
import testDatabaseConfig from '../src/config/test-database.config';

describe('URL Shortener (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [testDatabaseConfig],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  }, 30000); // Increase timeout to 30 seconds

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 10000); // Increase timeout to 10 seconds

  // Test health endpoint
  describe('Health Check API', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('info');
          expect(res.body).toHaveProperty('details');
        });
    });

    it('/info (GET)', () => {
      return request(app.getHttpServer())
        .get('/info')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('version');
          expect(res.body).toHaveProperty('environment');
        });
    });
  });

  // A simplified test for the links module
  describe('Links Module - Public Endpoint', () => {
    it('/public/links (POST) - Create public link', () => {
      return request(app.getHttpServer())
        .post('/public/links')
        .send({ originalUrl: 'https://example.com/test' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('shortCode');
          expect(res.body).toHaveProperty('originalUrl');
        });
    });
  });
});
