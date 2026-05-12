import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

import { FileRepository } from '../../persistence/file.repository';
import { AllConfigType } from '../../../../config/config.type';
import { FileType } from '../../../domain/file';

@Injectable()
export class FilesLocalService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly fileRepository: FileRepository,
  ) {}

  async create(
    file: Express.Multer.File | undefined,
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
        path: `/${this.configService.get('app.apiPrefix', {
          infer: true,
        })}/v1/${file.path}`,
      }),
    };
  }

  async remove(id: string): Promise<void> {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const apiPrefix = this.configService.get('app.apiPrefix', { infer: true });
    const relativePath = file.path.replace(`/${apiPrefix}/v1/files/`, '');
    const filePath = path.join(process.cwd(), 'files', relativePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.fileRepository.remove(id);
  }
}
