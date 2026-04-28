import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { QRRecord } from '../../domain/qr-record';

export abstract class QRRecordRepository {
  abstract create(
    data: Omit<QRRecord, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<QRRecord>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<QRRecord[]>;

  abstract findById(id: QRRecord['id']): Promise<NullableType<QRRecord>>;

  abstract findByUserId(userId: string): Promise<QRRecord[]>;

  abstract findBySlug(slug: string): Promise<NullableType<QRRecord>>;

  abstract update(
    id: QRRecord['id'],
    payload: Partial<QRRecord>,
  ): Promise<NullableType<QRRecord>>;

  abstract remove(id: QRRecord['id']): Promise<void>;
}
