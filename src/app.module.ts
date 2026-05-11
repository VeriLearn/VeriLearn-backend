import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigurationModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { EmailModule } from './email/email.module';
import { SearchModule } from './search/search.module';
import { VideoStreamingModule } from './video-streaming/video-streaming.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import stellarConfig from './config/stellar.config';
import emailConfig from './config/email.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, stellarConfig, emailConfig, redisConfig],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ConfigurationModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    BlockchainModule,
    EmailModule,
    SearchModule,
    VideoStreamingModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
