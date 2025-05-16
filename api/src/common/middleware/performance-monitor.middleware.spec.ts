import { Test } from '@nestjs/testing';
import { PerformanceMonitorMiddleware } from './performance-monitor.middleware';

describe('PerformanceMonitorMiddleware', () => {
  it('should be defined', async () => {
    const module = await Test.createTestingModule({
      providers: [PerformanceMonitorMiddleware],
    }).compile();

    const middleware = module.get<PerformanceMonitorMiddleware>(
      PerformanceMonitorMiddleware,
    );
    expect(middleware).toBeDefined();
  });
});
