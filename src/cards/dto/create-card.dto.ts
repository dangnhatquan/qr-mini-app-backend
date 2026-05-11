import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ type: Object, required: false, nullable: true })
  @IsObject()
  @IsOptional()
  editorStage?: Record<string, any> | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  previewImageId?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  password?: string | null;
}
