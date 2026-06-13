import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (config: ConfigService) => ({
        store: redisStore as any,
        host: config.get('redis.host', 'localhost'),
        port: config.get<number>('redis.port', 6379),
        password: config.get('redis.password') || undefined,
        ttl: config.get<number>('redis.ttl', 300),
      }),
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
