import { Injectable, Logger } from '@nestjs/common';
import * as os from 'os';

/**
 * Service para monitoramento de recursos do sistema
 * Importante para acompanhar o uso de recursos em escala vertical
 */
@Injectable()
export class SystemMonitorService {
  private readonly logger = new Logger('SystemMonitor');
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Inicia o monitoramento periódico do sistema
   * @param interval Intervalo em ms (padrão 60000 = 1 minuto)
   */
  startMonitoring(interval = 60000): void {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      try {
        this.logSystemStatus();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Erro durante monitoramento: ${errorMessage}`);
      }
    }, interval);

    this.logger.log(
      `Monitoramento de sistema iniciado (intervalo: ${interval}ms)`,
    );
  }

  /**
   * Para o monitoramento periódico
   */
  stopMonitoring(): void {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
    this.logger.log('Monitoramento de sistema parado');
  }

  /**
   * Registra o status atual do sistema
   */
  logSystemStatus(): void {
    try {
      const memoryUsage = this.getMemoryUsage();
      const cpuUsage = this.getCpuInfo();
      const uptime = this.getUptime();

      this.logger.log(`
      Sistema: ${uptime}
      Memória: ${memoryUsage.usedPercentage}% (${memoryUsage.used}MB/${memoryUsage.total}MB)
      CPU Cores: ${cpuUsage.cores}
      Carga de CPU: ${cpuUsage.loadAvg.map((load) => load.toFixed(2)).join(', ')}
    `);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao registrar status do sistema: ${errorMessage}`);
    }
  }

  /**
   * Obtém informações sobre o uso de memória
   */
  getMemoryUsage(): {
    total: number;
    free: number;
    used: number;
    usedPercentage: number;
  } {
    try {
      // Verificar se o módulo os está disponível e se as funções necessárias existem
      if (
        !os ||
        typeof os.totalmem !== 'function' ||
        typeof os.freemem !== 'function'
      ) {
        this.logger.warn('Funções de sistema operacional não disponíveis');
        return { total: 0, free: 0, used: 0, usedPercentage: 0 };
      }

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      return {
        total: Math.round(totalMem / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024),
        used: Math.round(usedMem / 1024 / 1024),
        usedPercentage: Math.round((usedMem / totalMem) * 100),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Erro ao obter informações de memória: ${errorMessage}`,
      );
      return { total: 0, free: 0, used: 0, usedPercentage: 0 };
    }
  }

  /**
   * Obtém informações sobre a CPU
   */
  getCpuInfo(): { cores: number; loadAvg: number[] } {
    try {
      // Verificar se o módulo os está disponível e se as funções necessárias existem
      if (
        !os ||
        typeof os.cpus !== 'function' ||
        typeof os.loadavg !== 'function'
      ) {
        this.logger.warn('Funções de CPU não disponíveis');
        return { cores: 0, loadAvg: [0, 0, 0] };
      }

      return {
        cores: os.cpus().length,
        loadAvg: os.loadavg(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao obter informações de CPU: ${errorMessage}`);
      return { cores: 0, loadAvg: [0, 0, 0] };
    }
  }

  /**
   * Obtém informações sobre o uptime do servidor
   */
  getUptime(): string {
    try {
      // Verificar se o módulo os está disponível
      if (!os || typeof os.uptime !== 'function') {
        this.logger.warn('Função uptime não disponível');
        return 'Uptime: indisponível';
      }

      const uptime = os.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      return `Uptime: ${days}d ${hours}h ${minutes}m`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao obter informações de uptime: ${errorMessage}`);
      return 'Uptime: erro';
    }
  }
}
