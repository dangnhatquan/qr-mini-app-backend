import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesService } from './files.service';
import { FileCategoryEnum } from './file-categories.enum';

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiQuery({ name: 'category', enum: FileCategoryEnum, required: false })
  async findAll(@Query('category') category?: FileCategoryEnum) {
    if (category) {
      return this.filesService.findByCategory(category);
    }
    // For now, only support filtering by category
    return [];
  }
}
