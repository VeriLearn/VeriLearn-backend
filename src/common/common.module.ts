import { Module, Global } from '@nestjs/common';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Global()
@Module({
  providers: [LoggingInterceptor],
  exports: [LoggingInterceptor],
})
export class CommonModule {}
