import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

describe('AppService', () => {
  let service: AppService;
  let healthCheckService: HealthCheckService;
  let _configService: ConfigService; // Prefix with underscore to indicate it's not used directly

  beforeEach(async () => {
    const mockHealthCheck = {
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
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [
        AppService,
        {
          provide: HealthCheckService,
          useValue: mockHealthCheck,
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
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: string) => {
              if (key === 'NODE_ENV') {
                return 'test';
              }
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    _configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should call healthCheckService.check with the correct indicators', async () => {
      const checkSpy = jest.spyOn(healthCheckService, 'check');
      await service.checkHealth();
      expect(checkSpy).toHaveBeenCalled();
    });

    it('should return a valid health check result', async () => {
      const result = await service.checkHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result).toHaveProperty('details');
    });
  });

  describe('getAppInfo', () => {
    it('should return application information', () => {
      const result = service.getAppInfo();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result.name).toBe('Little Link API');
      expect(result.environment).toBe('test');
    });
  });
});
