import { Test } from '@nestjs/testing';
import { SystemMonitorService } from './system-monitor.service';

describe('SystemMonitorService', () => {
  it('should be defined', async () => {
    const module = await Test.createTestingModule({
      providers: [SystemMonitorService],
    }).compile();

    const service = module.get<SystemMonitorService>(SystemMonitorService);
    expect(service).toBeDefined();
  });
});
