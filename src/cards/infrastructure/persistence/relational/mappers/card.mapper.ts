import { FileMapper } from '../../../../../files/infrastructure/persistence/relational/mappers/file.mapper';
import { Card } from '../../../../domain/card';
import { CardEntity } from '../entities/card.entity';

export class CardMapper {
  static toDomain(raw: CardEntity): Card {
    const domainEntity = new Card();
    domainEntity.id = raw.id;
    domainEntity.editorStage = raw.editorStage;
    if (raw.previewImage) {
      domainEntity.previewImage = FileMapper.toDomain(raw.previewImage);
    } else {
      domainEntity.previewImage = null;
    }
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Card): CardEntity {
    const persistenceEntity = new CardEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.editorStage = domainEntity.editorStage;
    if (domainEntity.previewImage) {
      persistenceEntity.previewImage = FileMapper.toPersistence(
        domainEntity.previewImage,
      );
    } else {
      persistenceEntity.previewImage = null;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;

    return persistenceEntity;
  }
}
