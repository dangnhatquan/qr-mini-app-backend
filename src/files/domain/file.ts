import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { Transform } from 'class-transformer';
import fileConfig from '@/files/config/file.config';
import { FileConfig, FileDriver } from '@/files/config/file-config.type';

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppConfig } from '@/config/app-config.type';
import appConfig from '@/config/app.config';
import { FileStatusEnum } from '@/files/file-statuses.enum';

export class FileType {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  @Allow()
  id: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/path/to/file.jpg',
  })
  @Transform(
    ({ value }) => {
      if ((fileConfig() as FileConfig).driver === FileDriver.LOCAL) {
        return (appConfig() as AppConfig).backendDomain + value;
      } else if (
        [FileDriver.S3_PRESIGNED, FileDriver.S3].includes(
          (fileConfig() as FileConfig).driver,
        )
      ) {
        const s3 = new S3Client({
          region: (fileConfig() as FileConfig).awsS3Region ?? '',
          endpoint: (fileConfig() as FileConfig).awsS3Endpoint, // BỔ SUNG DÒNG NÀY
          forcePathStyle: true, // BỔ SUNG DÒNG NÀY (Bắt buộc cho MinIO)
          credentials: {
            accessKeyId: (fileConfig() as FileConfig).accessKeyId ?? '',
            secretAccessKey: (fileConfig() as FileConfig).secretAccessKey ?? '',
          },
        });
        const command = new GetObjectCommand({
          Bucket: (fileConfig() as FileConfig).awsDefaultS3Bucket ?? '',
          Key: value,
        });

        return getSignedUrl(s3, command, { expiresIn: 3600 });
      }

      return value;
    },
    {
      toPlainOnly: true,
    },
  )
  path: string;

  @ApiProperty({
    type: String,
    enum: FileStatusEnum,
    example: FileStatusEnum.PENDING,
    nullable: true,
  })
  status?: FileStatusEnum | null;

  @ApiProperty({ type: Date, nullable: true })
  expiresAt?: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  createdAt?: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  updatedAt?: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  deletedAt?: Date | null;
}
