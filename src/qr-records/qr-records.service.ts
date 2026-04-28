import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { QRRecordRepository } from './infrastructure/persistence/qr-record.repository';
import { CreateQRRecordDto } from './dto/create-qr-record.dto';
import { UpdateQRRecordDto } from './dto/update-qr-record.dto';
import { QRRecord } from './domain/qr-record';
import bcrypt from 'bcryptjs';
import { Logger } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { EQRType } from './qr-records.enum';
import crypto from 'crypto';

@Injectable()
export class QRRecordsService {
  private readonly logger = new Logger(QRRecordsService.name);

  constructor(
    private readonly qrRecordRepository: QRRecordRepository,
    private readonly filesService: FilesService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async create(
    createQRRecordDto: CreateQRRecordDto,
    userId: string,
  ): Promise<QRRecord> {
    const {
      qrType,
      category,
      slug,
      password,
      editorStage,
      style,
      previewImageId,
      ...rest
    } = createQRRecordDto;

    let finalSlug = slug;
    if (qrType === EQRType.DYNAMIC && !finalSlug) {
      finalSlug = this.generateSlug();
    }

    let passwordHash: string | null = null;
    if (password) {
      const salt = await bcrypt.genSalt();
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Explicitly include data fields if they exist in rest
    const payload = { ...rest };

    this.logger.log('Creating QR Record:', { createQRRecordDto });

    const file = previewImageId
      ? await this.filesService.findById(previewImageId)
      : null;

    return this.qrRecordRepository.create({
      userId,
      type: qrType,
      category,
      slug: finalSlug || null,
      passwordHash,
      editorStage: editorStage || null,
      style: style || null,
      payload: Object.keys(payload).length > 0 ? payload : null,
      isDeleted: false,
      previewImage: file,
    });
  }

  async findQRRecordByUserId(userId: string): Promise<QRRecord[]> {
    return this.qrRecordRepository.findByUserId(userId);
  }

  async findOne(id: string): Promise<QRRecord | null> {
    return this.qrRecordRepository.findById(id);
  }

  async findBySlug(slug: string): Promise<QRRecord | null> {
    return this.qrRecordRepository.findBySlug(slug);
  }

  async getRedirectUrlBySlug(slug: string): Promise<string> {
    const record = await this.qrRecordRepository.findBySlug(slug);
    if (!record) {
      throw new NotFoundException('QR Record not found');
    }

    const appId = this.configService.get('zalo.appId', { infer: true });
    const devVersion = this.configService.get('zalo.devVersion', {
      infer: true,
    });
    return `https://zalo.me/s/${appId}/?env=DEVELOPMENT&version=${devVersion}&page=vcards/${record.id}`;
  }

  async update(
    id: string,
    updateQRRecordDto: UpdateQRRecordDto,
  ): Promise<QRRecord | null> {
    const {
      qrType,
      category,
      slug,
      password,
      editorStage,
      style,
      previewImageId,
      ...rest
    } = updateQRRecordDto;

    const existingRecord = await this.qrRecordRepository.findById(id);
    if (!existingRecord) {
      return null;
    }

    let passwordHash: string | undefined;
    if (password) {
      const salt = await bcrypt.genSalt();
      passwordHash = await bcrypt.hash(password, salt);
    }

    const payload = { ...rest };

    const updateData: Partial<QRRecord> = {};
    if (qrType !== undefined) {
      updateData.type = qrType;
    }
    if (category !== undefined) {
      updateData.category = category;
    }
    if (slug !== undefined) {
      updateData.slug = slug;
    }
    if (passwordHash !== undefined) {
      updateData.passwordHash = passwordHash;
    }
    if (editorStage !== undefined) {
      updateData.editorStage = editorStage;
    }
    if (style !== undefined) {
      updateData.style = style;
    }

    if (previewImageId !== undefined) {
      updateData.previewImage = previewImageId
        ? await this.filesService.findById(previewImageId)
        : null;
    }

    if (Object.keys(payload).length > 0) {
      updateData.payload = {
        ...(existingRecord.payload || {}),
        ...payload,
      };
    }

    this.logger.log('Updating QR Record:', { id, updateData });

    return this.qrRecordRepository.update(id, updateData);
  }

  async remove(id: string): Promise<void> {
    await this.qrRecordRepository.remove(id);
  }

  private generateSlug(length = 8): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }
}
