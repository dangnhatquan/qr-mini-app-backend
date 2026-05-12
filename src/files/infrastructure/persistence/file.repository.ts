import { NullableType } from '../../../utils/types/nullable.type';
import { FileType } from '../../domain/file';
import { FileCategoryEnum } from '../../file-categories.enum';

export abstract class FileRepository {
  abstract create(data: Omit<FileType, 'id'>): Promise<FileType>;

  abstract findById(id: FileType['id']): Promise<NullableType<FileType>>;

  abstract findByIds(ids: FileType['id'][]): Promise<FileType[]>;

  abstract findByCategory(category: FileCategoryEnum): Promise<FileType[]>;
  abstract remove(id: FileType['id']): Promise<void>;
}
