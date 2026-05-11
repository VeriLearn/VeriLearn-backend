import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConnectionPoolService } from './connection-pool.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get<number>('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: config.get('app.nodeEnv') === 'development',
        logging: config.get('app.nodeEnv') === 'development',
        ssl: config.get('database.ssl') ? { rejectUnauthorized: false } : false,
        extra: {
          min: config.get<number>('database.poolMin'),
          max: config.get<number>('database.poolMax'),
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),
  ],
  providers: [ConnectionPoolService],
  exports: [ConnectionPoolService],
})
export class DatabaseModule {}
