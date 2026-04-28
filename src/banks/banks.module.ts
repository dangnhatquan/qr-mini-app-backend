import { Module } from '@nestjs/common';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';
import { VietQRClient } from './vietqr.client';

@Module({
  controllers: [BanksController],
  providers: [BanksService, VietQRClient],
  exports: [BanksService],
})
export class BanksModule {}
