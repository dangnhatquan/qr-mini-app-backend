import { ApiProperty } from '@nestjs/swagger';
import { EQRType, EQRCategory } from '../qr-records.enum';
import { FileType } from '../../files/domain/file';

export class QRRecord {
  @ApiProperty({
    type: String,
    example: 'cbc828be-ee1b-4391-90c2-728f307373f7',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'cbc828be-ee1b-4391-90c2-728f307373f7',
  })
  userId: string;

  @ApiProperty({
    enum: EQRType,
    example: EQRType.STATIC,
  })
  type: EQRType;

  @ApiProperty({
    enum: EQRCategory,
    example: EQRCategory.WIFI,
  })
  category: EQRCategory;

  @ApiProperty({
    type: String,
    example: 'my-qr-code',
  })
  slug: string | null;

  @ApiProperty({
    type: String,
  })
  passwordHash: string | null;

  @ApiProperty({
    type: () => FileType,
  })
  previewImage?: FileType | null;

  @ApiProperty({
    type: Object,
  })
  payload: Record<string, any> | null;

  @ApiProperty({
    type: Object,
  })
  editorStage: Record<string, any> | null;

  @ApiProperty({
    type: Object,
  })
  style: Record<string, any> | null;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date | null;
}
