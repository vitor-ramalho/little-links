import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthCheckResult } from '@nestjs/terminus';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check the health status of the application' })
  @ApiResponse({ 
    status: 200, 
    description: 'The health check was successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        info: { 
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              status: { type: 'string' }
            }
          }
        },
        error: { 
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              status: { type: 'string' }
            }
          }
        },
        details: { 
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              status: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 503, description: 'The service is unavailable' })
  checkHealth(): Promise<HealthCheckResult> {
    return this.appService.checkHealth();
  }

  @Get('info')
  @ApiOperation({ summary: 'Get application information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Application information',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        version: { type: 'string' },
        environment: { type: 'string' }
      }
    }
  })
  getAppInfo() {
    return this.appService.getAppInfo();
  }
}