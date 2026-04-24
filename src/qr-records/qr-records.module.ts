import { Module } from '@nestjs/common';
import { QRRecordsService } from './qr-records.service';
import { QRRecordsController } from './qr-records.controller';
import { RelationalQRRecordPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [RelationalQRRecordPersistenceModule, FilesModule],
  controllers: [QRRecordsController],
  providers: [QRRecordsService],
  exports: [QRRecordsService, RelationalQRRecordPersistenceModule],
})
export class QRRecordsModule {}
