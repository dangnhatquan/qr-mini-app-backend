import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { FileCategoryEnum } from '../../../../file-categories.enum';

export class FileUploadDto {
  @ApiProperty({ example: 'image.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 138723 })
  @IsNumber()
  fileSize: number;

  @ApiProperty({ enum: FileCategoryEnum, required: false })
  @IsEnum(FileCategoryEnum)
  @IsOptional()
  category?: FileCategoryEnum;
}
