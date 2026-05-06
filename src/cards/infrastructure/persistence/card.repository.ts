import { NullableType } from '../../../utils/types/nullable.type';
import { Card } from '../../domain/card';

export abstract class CardRepository {
  abstract create(
    data: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Card>;

  abstract findById(id: Card['id']): Promise<NullableType<Card>>;

  abstract update(
    id: Card['id'],
    payload: Partial<Card>,
  ): Promise<NullableType<Card>>;

  abstract remove(id: Card['id']): Promise<void>;
}
