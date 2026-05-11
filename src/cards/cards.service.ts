import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { CardRepository } from './infrastructure/persistence/card.repository';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './domain/card';
import { FilesService } from '../files/files.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    private readonly cardRepository: CardRepository,
    private readonly filesService: FilesService,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const { editorStage, previewImageId, password } = createCardDto;

    const previewImage = previewImageId
      ? await this.filesService.findById(previewImageId)
      : null;

    let passwordHash: string | null = null;
    if (password) {
      const salt = await bcrypt.genSalt();
      passwordHash = await bcrypt.hash(password, salt);
    }

    this.logger.log('Creating Card');

    return this.cardRepository.create({
      editorStage: editorStage ?? null,
      previewImage,
      passwordHash,
    });
  }

  async findOne(id: string, password?: string): Promise<Card> {
    const card = await this.findById(id);

    if (card.passwordHash) {
      if (!password) {
        throw new ForbiddenException('Password required for this card');
      }

      const isPasswordValid = await bcrypt.compare(password, card.passwordHash);
      if (!isPasswordValid) {
        throw new ForbiddenException('Invalid password');
      }
    }

    return card;
  }

  async findById(id: string): Promise<Card> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(`Card with id "${id}" not found`);
    }
    return card;
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const { editorStage, previewImageId, password } = updateCardDto;

    const updateData: Partial<Card> = {};

    if (editorStage !== undefined) {
      updateData.editorStage = editorStage ?? null;
    }

    if (previewImageId !== undefined) {
      updateData.previewImage = previewImageId
        ? await this.filesService.findById(previewImageId)
        : null;
    }

    if (password !== undefined) {
      if (password) {
        const salt = await bcrypt.genSalt();
        updateData.passwordHash = await bcrypt.hash(password, salt);
      } else {
        updateData.passwordHash = null;
      }
    }

    this.logger.log('Updating Card:', { id, updateData });

    const updated = await this.cardRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Card with id "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.cardRepository.remove(id);
  }
}
