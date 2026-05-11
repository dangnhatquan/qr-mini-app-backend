import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './domain/card';

@ApiTags('Cards')
@Controller({
  path: 'cards',
  version: '1',
})
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({ type: Card })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCardDto: CreateCardDto): Promise<Card> {
    return this.cardsService.create(createCardDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: Card })
  @ApiParam({ name: 'id', type: String, required: true })
  @Post(':id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id') id: string,
    @Body('password') password?: string,
  ): Promise<Card> {
    return this.cardsService.findOne(id, password);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: Card })
  @ApiParam({ name: 'id', type: String, required: true })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    return this.cardsService.update(id, updateCardDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiNoContentResponse()
  @ApiParam({ name: 'id', type: String, required: true })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.cardsService.remove(id);
  }
}
