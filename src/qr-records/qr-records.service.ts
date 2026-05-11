import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { QRRecordRepository } from './infrastructure/persistence/qr-record.repository';
import { CreateQRRecordDto } from './dto/create-qr-record.dto';
import { UpdateQRRecordDto } from './dto/update-qr-record.dto';
import { QRRecord } from './domain/qr-record';
import { Logger } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { CardsService } from '../cards/cards.service';
import { EQRType, EQRCategory } from './qr-records.enum';
import crypto from 'crypto';

@Injectable()
export class QRRecordsService {
  private readonly logger = new Logger(QRRecordsService.name);

  constructor(
    private readonly qrRecordRepository: QRRecordRepository,
    private readonly filesService: FilesService,
    private readonly cardsService: CardsService,
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

    // Explicitly include data fields if they exist in rest
    const payload = { ...rest };

    let hasPassword = !!password;
    if (category === EQRCategory.GREETING && payload.greetingData?.cardId) {
      const cardPassword = payload.greetingData.password || password;
      if (cardPassword) {
        await this.cardsService.update(payload.greetingData.cardId, {
          password: cardPassword,
        });
        hasPassword = true;
        // Clean up password from payload to avoid storing it in plain text jsonb
        delete payload.greetingData.password;
      }
    }

    this.logger.log('Creating QR Record:', { createQRRecordDto });

    const file = previewImageId
      ? await this.filesService.findById(previewImageId)
      : null;

    return this.qrRecordRepository.create({
      userId,
      type: qrType,
      category,
      slug: finalSlug || null,
      hasPassword,
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
    const record = await this.qrRecordRepository.findById(id);
    if (
      record?.category === EQRCategory.GREETING &&
      record.payload?.greetingData
    ) {
      record.payload.greetingData.hasPassword = record.hasPassword;
    }
    return record;
  }

  async findBySlug(slug: string): Promise<QRRecord | null> {
    const record = await this.qrRecordRepository.findBySlug(slug);
    if (
      record?.category === EQRCategory.GREETING &&
      record.payload?.greetingData
    ) {
      record.payload.greetingData.hasPassword = record.hasPassword;
    }
    return record;
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
    return `https://zalo.me/s/${appId}/?env=TESTING&version=${devVersion}&page=vcards/${record.id}`;
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

    const payload = { ...rest };
    let hasPasswordUpdate: boolean | undefined;

    if (
      (category === EQRCategory.GREETING ||
        existingRecord.category === EQRCategory.GREETING) &&
      (payload.greetingData?.cardId ||
        existingRecord.payload?.greetingData?.cardId)
    ) {
      const cardId =
        payload.greetingData?.cardId ||
        existingRecord.payload?.greetingData?.cardId;
      const cardPassword = payload.greetingData?.password || password;

      if (cardPassword !== undefined) {
        await this.cardsService.update(cardId, { password: cardPassword });
        hasPasswordUpdate = !!cardPassword;
        if (payload.greetingData) {
          delete payload.greetingData.password;
        }
      }
    } else if (password !== undefined) {
      hasPasswordUpdate = !!password;
    }

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
    if (hasPasswordUpdate !== undefined) {
      updateData.hasPassword = hasPasswordUpdate;
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
    const record = await this.qrRecordRepository.findById(id);
    if (record?.category === EQRCategory.GREETING) {
      const cardId = record.payload?.greetingData?.cardId as string | undefined;
      if (cardId) {
        await this.cardsService.remove(cardId);
      }
    }
    await this.qrRecordRepository.remove(id);
  }

  private generateSlug(length = 8): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }
}
