import { Module } from '@nestjs/common';
import { SystemMonitorService } from './system-monitor.service';


@Module({
  providers: [SystemMonitorService],
  exports: [SystemMonitorService],
})
export class MonitoringModule {}
