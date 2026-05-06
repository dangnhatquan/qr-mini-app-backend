import { Module } from '@nestjs/common';
import { QRRecordsService } from './qr-records.service';
import { QRRecordsController } from './qr-records.controller';
import { RelationalQRRecordPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [RelationalQRRecordPersistenceModule, FilesModule, CardsModule],
  controllers: [QRRecordsController],
  providers: [QRRecordsService],
  exports: [QRRecordsService, RelationalQRRecordPersistenceModule],
})
export class QRRecordsModule {}
