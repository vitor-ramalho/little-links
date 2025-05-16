#!/usr/bin/env node

/**
 * Script para iniciar o aplicativo em modo cluster para máximo aproveitamento
 * dos recursos disponíveis em um único servidor (escalabilidade vertical)
 */

const cluster = require('cluster');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const net = require('net');

// Verificar ambiente
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const numCPUs = os.cpus().length;
const memoryInfo = process.memoryUsage();
const serverInfo = {
  platform: os.platform(),
  arch: os.arch(),
  cpus: numCPUs,
  totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024),
  freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024),
  nodeHeap: Math.round(memoryInfo.heapTotal / 1024 / 1024),
};

console.log('=== Little Link - Inicialização em Modo Cluster ===');
console.log('Servidor:');
console.log(`  Sistema: ${serverInfo.platform} ${serverInfo.arch}`);
console.log(`  CPUs: ${serverInfo.cpus} núcleos`);
console.log(
  `  Memória: ${serverInfo.freeMemory}GB livre de ${serverInfo.totalMemory}GB total`,
);
console.log(`  Node.js Heap: ${serverInfo.nodeHeap}MB`);

// Arquivo de log
const logFile = path.join(__dirname, 'cluster-log.txt');
fs.writeFileSync(logFile, `Inicialização: ${new Date().toISOString()}\n`);
fs.appendFileSync(
  logFile,
  `Servidor: ${JSON.stringify(serverInfo, null, 2)}\n`,
);

// Função para log
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Verificar se o banco de dados está acessível
async function checkDatabaseConnection() {
  const dbHost = process.env.DATABASE_HOST || 'localhost';
  const dbPort = parseInt(process.env.DATABASE_PORT || '5432', 10);

  log(`Verificando conexão com banco de dados em ${dbHost}:${dbPort}...`);

  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(5000); // 5s timeout

    socket.on('connect', () => {
      log(`✅ Conexão com banco de dados estabelecida em ${dbHost}:${dbPort}`);
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      log(`❌ Timeout ao conectar no banco de dados ${dbHost}:${dbPort}`);
      socket.destroy();
      resolve(false);
    });

    socket.on('error', (err) => {
      log(
        `❌ Erro ao conectar no banco de dados ${dbHost}:${dbPort}: ${err.message}`,
      );
      socket.destroy();
      resolve(false);
    });

    socket.connect(dbPort, dbHost);
  });
}

// Função que inicia o serviço PostgreSQL localmente se necessário
async function startLocalPostgres() {
  try {
    log('Tentando iniciar PostgreSQL localmente...');

    if (serverInfo.platform === 'darwin') {
      // macOS
      await execAsync('brew services start postgresql');
    } else if (serverInfo.platform === 'linux') {
      // Linux
      await execAsync('sudo service postgresql start');
    }

    log('⏳ Aguardando PostgreSQL iniciar (10s)...');
    await new Promise((resolve) => setTimeout(resolve, 10000));

    return true;
  } catch (error) {
    log(`❌ Erro ao iniciar PostgreSQL: ${error.message}`);
    return false;
  }
}

// Função principal
async function run() {
  if (cluster.isMaster) {
    log(`Iniciando Servidor Principal (PID: ${process.pid})`);

    // Verificar conexão com banco de dados
    let dbConnected = await checkDatabaseConnection();

    if (!dbConnected) {
      log(
        '⚠️ Banco de dados não disponível, tentando ajustar configurações...',
      );

      // Se DATABASE_HOST=postgres, tente mudar para localhost
      if (process.env.DATABASE_HOST === 'postgres') {
        log('Mudando DATABASE_HOST de "postgres" para "localhost"');
        process.env.DATABASE_HOST = 'localhost';
        dbConnected = await checkDatabaseConnection();
      }

      // Se ainda não conectou, tente iniciar o PostgreSQL local
      if (!dbConnected) {
        await startLocalPostgres();
        dbConnected = await checkDatabaseConnection();
      }

      if (!dbConnected) {
        log(
          '❌ Não foi possível conectar ao banco de dados. Abortando inicialização.',
        );
        process.exit(1);
      }
    }

    log(
      `✅ Banco de dados conectado. Criando ${numCPUs} workers para processamento...`,
    );

    // Cria workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork({ DATABASE_HOST: process.env.DATABASE_HOST });
    }

    // Registro de eventos do cluster
    cluster.on('online', (worker) => {
      log(`Worker ${worker.process.pid} está online`);
    });

    cluster.on('exit', (worker, code, signal) => {
      log(
        `Worker ${worker.process.pid} encerrado com código ${code} e sinal ${signal}`,
      );
      log('Iniciando novo worker...');
      cluster.fork({ DATABASE_HOST: process.env.DATABASE_HOST }); // Substitui o worker
    });

    // Monitor de recursos do servidor
    setInterval(() => {
      const memUsage = Math.round(
        ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
      );
      log(
        `Uso de recursos: CPU Load: ${os.loadavg()[0].toFixed(2)}, Memória: ${memUsage}%`,
      );
    }, 60000); // 1 minuto
  } else {
    // Worker - carrega o aplicativo
    log(`Worker ${process.pid} iniciando aplicação...`);
    require('../dist/main');
  }
}

run().catch((error) => {
  log(`❌ ERRO FATAL: ${error.message}`);
  process.exit(1);
});
