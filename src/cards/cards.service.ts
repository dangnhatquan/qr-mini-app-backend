import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CardRepository } from './infrastructure/persistence/card.repository';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './domain/card';
import { FilesService } from '../files/files.service';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    private readonly cardRepository: CardRepository,
    private readonly filesService: FilesService,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const { editorStage, previewImageId } = createCardDto;

    const previewImage = previewImageId
      ? await this.filesService.findById(previewImageId)
      : null;

    this.logger.log('Creating Card');

    return this.cardRepository.create({
      editorStage: editorStage ?? null,
      previewImage,
    });
  }

  async findOne(id: string): Promise<Card> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(`Card with id "${id}" not found`);
    }
    return card;
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const { editorStage, previewImageId } = updateCardDto;

    const updateData: Partial<Card> = {};

    if (editorStage !== undefined) {
      updateData.editorStage = editorStage ?? null;
    }

    if (previewImageId !== undefined) {
      updateData.previewImage = previewImageId
        ? await this.filesService.findById(previewImageId)
        : null;
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
