import {
  HttpStatus,
  Injectable,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileRepository } from '../../persistence/file.repository';

import { FileUploadDto } from './dto/file.dto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { FileType } from '../../../domain/file';
import { AllConfigType } from '../../../../config/config.type';

@Injectable()
export class FilesS3PresignedService {
  private s3: S3Client;

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.s3 = new S3Client({
      region: configService.get('file.awsS3Region', { infer: true }),
      credentials: {
        accessKeyId: configService.getOrThrow('file.accessKeyId', {
          infer: true,
        }),
        secretAccessKey: configService.getOrThrow('file.secretAccessKey', {
          infer: true,
        }),
      },
      requestChecksumCalculation: 'WHEN_REQUIRED', // ← thêm
      responseChecksumValidation: 'WHEN_REQUIRED', // ← thêm
    });
  }

  async create(
    file: FileUploadDto,
  ): Promise<{ file: FileType; uploadSignedUrl: string }> {
    if (!file.fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: `cantUploadFileType`,
        },
      });
    }

    if (
      file.fileSize >
      (this.configService.get('file.maxFileSize', {
        infer: true,
      }) || 0)
    ) {
      throw new PayloadTooLargeException({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        error: 'Payload Too Large',
        message: 'File too large',
      });
    }

    const key = `${randomStringGenerator()}.${file.fileName
      .split('.')
      .pop()
      ?.toLowerCase()}`;

    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow('file.awsDefaultS3Bucket', {
        infer: true,
      }),
      Key: key,
      ContentLength: file.fileSize,
    });
    let signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });

    // Rewrite to be relative to /minio-proxy
    const endpoint = this.configService.get('file.awsS3Endpoint', {
      infer: true,
    });
    if (endpoint) {
      signedUrl = signedUrl.replace(endpoint, '/minio-proxy');
    }

    const bucket = this.configService.getOrThrow('file.awsDefaultS3Bucket', {
      infer: true,
    });

    const data = await this.fileRepository.create({
      path: `/minio-proxy/${bucket}/${key}`,
      category: file.category,
    });

    return {
      file: data,
      uploadSignedUrl: signedUrl,
    };
  }
}
