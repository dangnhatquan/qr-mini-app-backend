import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  Allow,
} from 'class-validator';
import { EQRType, EQRCategory } from '../qr-records.enum';

export class CreateQRRecordDto {
  @ApiProperty({ enum: EQRType, example: EQRType.STATIC })
  @IsEnum(EQRType)
  @IsNotEmpty()
  qrType: EQRType;

  @ApiProperty({ enum: EQRCategory, example: EQRCategory.WIFI })
  @IsEnum(EQRCategory)
  @IsNotEmpty()
  category: EQRCategory;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ type: Object, required: false })
  @IsObject()
  @IsOptional()
  editorStage?: Record<string, any>;

  @ApiProperty({ type: Object, required: false })
  @IsObject()
  @IsOptional()
  style?: Record<string, any>;

  @ApiProperty({ type: Object, required: false })
  @Allow()
  wifiData?: Record<string, any>;

  @ApiProperty({ type: Object, required: false })
  @Allow()
  bankingData?: Record<string, any>;

  @ApiProperty({ type: Object, required: false })
  @Allow()
  vcardData?: Record<string, any>;

  @ApiProperty({
    type: Object,
    required: false,
    description: 'Greeting card data. Include `cardId` (uuid) to link a Card.',
  })
  @Allow()
  greetingData?: Record<string, any>;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  previewImageId?: string;

  // Allow any other fields to be captured as part of the payload
  [key: string]: any;
}
