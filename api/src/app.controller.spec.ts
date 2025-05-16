import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
  TerminusModule,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TerminusModule,
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              info: {
                database: { status: 'up' },
                memory_heap: { status: 'up' },
                memory_rss: { status: 'up' },
                disk: { status: 'up' },
              },
              details: {
                database: { status: 'up' },
                memory_heap: { status: 'up' },
                memory_rss: { status: 'up' },
                disk: { status: 'up' },
              },
            }),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({
              database: { status: 'up' },
            }),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn().mockResolvedValue({
              memory_heap: { status: 'up' },
            }),
            checkRSS: jest.fn().mockResolvedValue({
              memory_rss: { status: 'up' },
            }),
          },
        },
        {
          provide: DiskHealthIndicator,
          useValue: {
            checkStorage: jest.fn().mockResolvedValue({
              disk: { status: 'up' },
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('checkHealth', () => {
    it('should return health check results', async () => {
      const result = await appController.checkHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result).toHaveProperty('details');
    });
  });

  describe('getAppInfo', () => {
    it('should return application information', () => {
      const mockInfo = {
        name: 'Little Link API',
        version: '1.0.0',
        environment: 'test',
      };

      jest.spyOn(appService, 'getAppInfo').mockImplementation(() => mockInfo);

      const result = appController.getAppInfo();
      expect(result).toEqual(mockInfo);
      expect(result.name).toBe('Little Link API');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
    });
  });
});
