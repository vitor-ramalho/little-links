import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { registerAs } from '@nestjs/config';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const host =
    process.env.DATABASE_HOST ??
    (process.env.NODE_ENV === 'production' ? 'localhost' : 'postgres');

  console.info(`Configurando banco de dados com host: ${host}`);

  return {
    type: 'postgres',
    host: host,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USERNAME ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    database: process.env.DATABASE_NAME ?? 'little_link',
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',

    poolSize: parseInt(process.env.DB_POOL_SIZE ?? '20', 10),
    connectTimeoutMS: 10000,
    maxQueryExecutionTime: 5000,

    cache: {
      duration: 30000,
    },

    retryAttempts: 5,
    retryDelay: 2000,

    extra: {
      max: parseInt(process.env.DB_POOL_SIZE ?? '20', 10),
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    },
  };
});
