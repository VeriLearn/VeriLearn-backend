import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [MonitoringService],
  controllers: [MonitoringController],
  exports: [MonitoringService],
})
export class MonitoringModule {}
