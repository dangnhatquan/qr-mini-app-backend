import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../../files/domain/file';

export class Card {
  @ApiProperty({
    type: String,
    example: 'cbc828be-ee1b-4391-90c2-728f307373f7',
  })
  id: string;

  @ApiProperty({
    type: Object,
    nullable: true,
  })
  editorStage: Record<string, any> | null;

  @ApiProperty({
    type: () => FileType,
    nullable: true,
  })
  previewImage?: FileType | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  deletedAt: Date | null;
}
