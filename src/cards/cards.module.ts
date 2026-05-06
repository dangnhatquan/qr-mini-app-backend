import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { RelationalCardPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [RelationalCardPersistenceModule, FilesModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService, RelationalCardPersistenceModule],
})
export class CardsModule {}
