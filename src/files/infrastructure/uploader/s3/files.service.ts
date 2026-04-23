import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { FileRepository } from '@/files/infrastructure/persistence/file.repository';
import { FileType } from '@/files/domain/file';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

import { FileStatusEnum } from '@/files/file-statuses.enum';

@Injectable()
export class FilesS3Service {
  private s3: S3Client;

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.s3 = new S3Client({
      region: configService.get('file.awsS3Region', { infer: true }),
      endpoint: configService.get('file.awsS3Endpoint', { infer: true }),
      forcePathStyle: true,
      credentials: {
        accessKeyId: configService.getOrThrow('file.accessKeyId', {
          infer: true,
        }),
        secretAccessKey: configService.getOrThrow('file.secretAccessKey', {
          infer: true,
        }),
      },
    });
  }

  async create(
    file: Express.MulterS3.File | undefined,
  ): Promise<{ file: FileType }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      });
    }

    return {
      file: await this.fileRepository.create({
        path: file.key,
        status: FileStatusEnum.ATTACHED,
      }),
    };
  }

  async getUploadPresignedUrl(
    fileName: string,
  ): Promise<{ file: FileType; uploadSignedUrl: string }> {
    const key = `${randomStringGenerator()}.${fileName
      .split('.')
      .pop()
      ?.toLowerCase()}`;

    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow('file.awsDefaultS3Bucket', {
        infer: true,
      }),
      Key: key,
    });

    const uploadSignedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 3600,
    });

    const data = await this.fileRepository.create({
      path: key,
      status: FileStatusEnum.PENDING,
    });

    return {
      file: data,
      uploadSignedUrl,
    };
  }

  async getDownloadSignedUrl(
    id: string,
  ): Promise<{ downloadSignedUrl: string }> {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow('file.awsDefaultS3Bucket', {
        infer: true,
      }),
      Key: file.path,
    });

    const downloadSignedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 3600,
    });

    return { downloadSignedUrl };
  }
}
