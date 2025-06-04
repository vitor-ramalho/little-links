import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { UsersModule } from './users/users.module';
import { LinksModule } from './links/links.module';
import { AuthModule } from './auth/auth.module';
import { MonitoringModule } from './common/monitoring/monitoring.module';
import { QrCodeModule } from './qrcode/qrcode.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PerformanceMonitorMiddleware } from './common/middleware/performance-monitor.middleware';
import databaseConfig from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database') ?? {},
    }),
    TerminusModule,
    UsersModule,
    LinksModule,
    AuthModule,
    QrCodeModule,
    AnalyticsModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(PerformanceMonitorMiddleware).forRoutes('*');
  }
}
