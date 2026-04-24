import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QRRecordEntity } from '../entities/qr-record.entity';
import { QRRecord } from '../../../../domain/qr-record';
import { QRRecordRepository } from '../../qr-record.repository';
import { QRRecordMapper } from '../mappers/qr-record.mapper';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class QRRecordRelationalRepository implements QRRecordRepository {
  constructor(
    @InjectRepository(QRRecordEntity)
    private readonly repository: Repository<QRRecordEntity>,
  ) {}

  async create(data: QRRecord): Promise<QRRecord> {
    const persistenceModel = QRRecordMapper.toPersistence(data);
    const newEntity = await this.repository.save(
      this.repository.create(persistenceModel),
    );
    return QRRecordMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<QRRecord[]> {
    const entities = await this.repository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((user) => QRRecordMapper.toDomain(user));
  }

  async findById(id: QRRecord['id']): Promise<NullableType<QRRecord>> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? QRRecordMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<QRRecord[]> {
    const entities = await this.repository.find({
      where: { userId },
    });

    return entities.map((entity) => QRRecordMapper.toDomain(entity));
  }

  async update(
    id: QRRecord['id'],
    payload: Partial<QRRecord>,
  ): Promise<NullableType<QRRecord>> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    const updatedEntity = await this.repository.save(
      this.repository.create(
        QRRecordMapper.toPersistence({
          ...QRRecordMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return QRRecordMapper.toDomain(updatedEntity);
  }

  async remove(id: QRRecord['id']): Promise<void> {
    await this.repository.softDelete(id);
  }
}
