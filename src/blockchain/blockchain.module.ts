import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './entities/credential.entity';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Credential])],
  providers: [BlockchainService],
  controllers: [BlockchainController],
  exports: [BlockchainService],
})
export class BlockchainModule {}
