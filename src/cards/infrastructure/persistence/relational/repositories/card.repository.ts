import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity } from '../entities/card.entity';
import { Card } from '../../../../domain/card';
import { CardRepository } from '../../card.repository';
import { CardMapper } from '../mappers/card.mapper';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class CardRelationalRepository implements CardRepository {
  constructor(
    @InjectRepository(CardEntity)
    private readonly repository: Repository<CardEntity>,
  ) {}

  async create(
    data: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Card> {
    const persistenceModel = CardMapper.toPersistence(data as Card);
    const newEntity = await this.repository.save(
      this.repository.create(persistenceModel),
    );
    return CardMapper.toDomain(newEntity);
  }

  async findById(id: Card['id']): Promise<NullableType<Card>> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? CardMapper.toDomain(entity) : null;
  }

  async update(
    id: Card['id'],
    payload: Partial<Card>,
  ): Promise<NullableType<Card>> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    const updatedEntity = await this.repository.save(
      this.repository.create(
        CardMapper.toPersistence({
          ...CardMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return CardMapper.toDomain(updatedEntity);
  }

  async remove(id: Card['id']): Promise<void> {
    await this.repository.softDelete(id);
  }
}
