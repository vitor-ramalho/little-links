import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserAgentService } from './services/user-agent.service';

@Module({
  imports: [ConfigModule],
  providers: [UserAgentService],
  exports: [UserAgentService],
})
export class CommonModule {}
