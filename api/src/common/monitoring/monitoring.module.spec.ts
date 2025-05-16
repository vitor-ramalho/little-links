import { Test } from '@nestjs/testing';
import { MonitoringModule } from './monitoring.module';
import { SystemMonitorService } from './system-monitor.service';

describe('MonitoringModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [MonitoringModule],
    }).compile();

    expect(module).toBeDefined();
    const service = module.get<SystemMonitorService>(SystemMonitorService);
    expect(service).toBeInstanceOf(SystemMonitorService);
  });
});
