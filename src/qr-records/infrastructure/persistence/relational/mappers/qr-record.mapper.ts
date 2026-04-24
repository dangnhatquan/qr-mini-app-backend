import { FileMapper } from '../../../../../files/infrastructure/persistence/relational/mappers/file.mapper';
import { QRRecord } from '../../../../domain/qr-record';
import { QRRecordEntity } from '../entities/qr-record.entity';

export class QRRecordMapper {
  static toDomain(raw: QRRecordEntity): QRRecord {
    const domainEntity = new QRRecord();
    domainEntity.id = raw.id;
    domainEntity.userId = raw.userId;
    domainEntity.type = raw.type;
    domainEntity.category = raw.category;
    domainEntity.slug = raw.slug;
    domainEntity.passwordHash = raw.passwordHash;
    if (raw.previewImage) {
      domainEntity.previewImage = FileMapper.toDomain(raw.previewImage);
    }
    domainEntity.payload = raw.payload;
    domainEntity.editorStage = raw.editorStage;
    domainEntity.isDeleted = raw.isDeleted;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: QRRecord): QRRecordEntity {
    const persistenceEntity = new QRRecordEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.type = domainEntity.type;
    persistenceEntity.category = domainEntity.category;
    persistenceEntity.slug = domainEntity.slug;
    persistenceEntity.passwordHash = domainEntity.passwordHash;
    if (domainEntity.previewImage) {
      persistenceEntity.previewImage = FileMapper.toPersistence(
        domainEntity.previewImage,
      );
    }
    persistenceEntity.payload = domainEntity.payload;
    persistenceEntity.editorStage = domainEntity.editorStage;
    persistenceEntity.isDeleted = domainEntity.isDeleted;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;

    return persistenceEntity;
  }
}
