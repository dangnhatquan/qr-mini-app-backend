import { FileType } from '@/files/domain/file';
import { FileEntity } from '@/files/infrastructure/persistence/relational/entities/file.entity';

export class FileMapper {
  static toDomain(raw: FileEntity): FileType {
    const domainEntity = new FileType();
    domainEntity.id = raw.id;
    domainEntity.path = raw.path;
    domainEntity.status = raw.status;
    domainEntity.category = raw.category;
    domainEntity.expiresAt = raw.expiresAt;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: FileType): FileEntity {
    const persistenceEntity = new FileEntity();
    persistenceEntity.id = domainEntity.id;
    let path = domainEntity.path;
    if (path && path.includes('/minio-proxy/')) {
      path = path.substring(path.indexOf('/minio-proxy/'));
    }
    persistenceEntity.path = path;
    if (domainEntity.status !== undefined) {
      persistenceEntity.status = domainEntity.status;
    }
    if (domainEntity.category !== undefined) {
      persistenceEntity.category = domainEntity.category;
    }
    if (domainEntity.expiresAt !== undefined) {
      persistenceEntity.expiresAt = domainEntity.expiresAt;
    }
    if (domainEntity.createdAt !== undefined) {
      persistenceEntity.createdAt = domainEntity.createdAt;
    }
    if (domainEntity.updatedAt !== undefined) {
      persistenceEntity.updatedAt = domainEntity.updatedAt;
    }
    if (domainEntity.deletedAt !== undefined) {
      persistenceEntity.deletedAt = domainEntity.deletedAt;
    }
    return persistenceEntity;
  }
}
