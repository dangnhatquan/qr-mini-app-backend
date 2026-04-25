import { Injectable } from '@nestjs/common';
import { QRRecordRepository } from './infrastructure/persistence/qr-record.repository';
import { CreateQRRecordDto } from './dto/create-qr-record.dto';
import { UpdateQRRecordDto } from './dto/update-qr-record.dto';
import { QRRecord } from './domain/qr-record';
import bcrypt from 'bcryptjs';
import { Logger } from '@nestjs/common';
import { FilesService } from '../files/files.service';

@Injectable()
export class QRRecordsService {
  private readonly logger = new Logger(QRRecordsService.name);

  constructor(
    private readonly qrRecordRepository: QRRecordRepository,
    private readonly filesService: FilesService,
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
      previewImageId,
      ...rest
    } = createQRRecordDto;

    let passwordHash: string | null = null;
    if (password) {
      const salt = await bcrypt.genSalt();
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Explicitly include data fields if they exist in rest
    const payload = { ...rest };

    this.logger.log('Creating QR Record:', { createQRRecordDto });

    const file = await this.filesService.findById(previewImageId);

    return this.qrRecordRepository.create({
      userId,
      type: qrType,
      category,
      slug: slug || null,
      passwordHash,
      editorStage: editorStage || null,
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
}
