import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SystemMonitorService } from './common/monitoring/system-monitor.service';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  logger.log('Starting application with multi-core optimizations');

  // Create NestJS instance
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    bodyParser: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // API prefix with exclusion for redirection routes
  app.setGlobalPrefix('api', {
    exclude: [':shortCode'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Little Link API')
    .setDescription(
      'URL shortener API documentation with health monitoring capabilities',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health', 'Application health and monitoring endpoints')
    .addTag('links', 'URL shortening and management endpoints')
    .addTag('auth', 'Authentication and user management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Service configuration and initialization
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<string | number>('PORT', 3000);

  // Start system monitoring
  const monitorService = app.get<SystemMonitorService>(SystemMonitorService);
  monitorService.startMonitoring();
  monitorService.logSystemStatus();

  // Start the server
  await app.listen(Number(port));
  logger.log(`Application running on port ${port}`);
  logger.log(
    `System resources: ${JSON.stringify(monitorService.getMemoryUsage())}`,
  );
  logger.log(`Available CPU cores: ${monitorService.getCpuInfo().cores}`);
}

// Handle uncaught exceptions
process.on('unhandledRejection', (reason) => {
  const logger = new Logger('Unhandled Rejection');
  logger.error(reason);
});

process.on('uncaughtException', (error) => {
  const logger = new Logger('Uncaught Exception');
  logger.error(error);
});

// Start the application
void bootstrap();
