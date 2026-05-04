import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QRRecordEntity } from './entities/qr-record.entity';
import { QRRecordRepository } from '../qr-record.repository';
import { QRRecordRelationalRepository } from './repositories/qr-record.repository';

@Module({
  imports: [TypeOrmModule.forFeature([QRRecordEntity])],
  providers: [
    {
      provide: QRRecordRepository,
      useClass: QRRecordRelationalRepository,
    },
  ],
  exports: [QRRecordRepository],
})
export class RelationalQRRecordPersistenceModule {}
