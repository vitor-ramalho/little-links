import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Logger } from '@nestjs/common';


@Injectable()
export class PerformanceMonitorMiddleware implements NestMiddleware {
  private readonly logger = new Logger('PerformanceMonitor');

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, originalUrl } = req;

    // Registra uso de memória ao iniciar a requisição
    const memoryBefore = process.memoryUsage();

    // Função para ser executada quando a resposta for finalizada
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      // Registra uso de memória após finalizar a requisição
      const memoryAfter = process.memoryUsage();
      const memoryDiff = {
        rss: (memoryAfter.rss - memoryBefore.rss) / 1024 / 1024,
        heapTotal:
          (memoryAfter.heapTotal - memoryBefore.heapTotal) / 1024 / 1024,
        heapUsed: (memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024,
      };

      // Log de desempenho detalhado
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${duration}ms - ` +
          `Memory: RSS: ${memoryDiff.rss.toFixed(2)}MB, Heap: ${memoryDiff.heapUsed.toFixed(2)}MB`,
      );

      // Alerta para requisições lentas (mais de 1 segundo)
      if (duration > 1000) {
        this.logger.warn(
          `Requisição lenta detectada: ${method} ${originalUrl} ${statusCode} ${duration}ms`,
        );
      }
    });

    next();
  }
}
