import { Injectable } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private configService: ConfigService,
  ) {}

  @HealthCheck()
  async checkHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database connection check
      async (): Promise<HealthIndicatorResult> => this.db.pingCheck('database'),

      // Memory usage check - raise error if heap usage > 1GB
      async (): Promise<HealthIndicatorResult> =>
        this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),

      // Memory RSS check - raise error if RSS > 2GB
      async (): Promise<HealthIndicatorResult> =>
        this.memory.checkRSS('memory_rss', 2 * 1024 * 1024 * 1024),

      // Disk space check - ensure at least 500MB of free space
      async (): Promise<HealthIndicatorResult> =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.5, // 50%
        }),
    ]);
  }

  getAppInfo(): { name: string; version: string; environment: string } {
    return {
      name: 'Little Link API',
      version: process.env.npm_package_version ?? '1.0.0',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
    };
  }
}
