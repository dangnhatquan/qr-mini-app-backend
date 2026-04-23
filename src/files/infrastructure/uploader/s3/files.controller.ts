import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesS3Service } from './files.service';
import { FileResponseDto } from './dto/file-response.dto';
import { FileType } from '@/files/domain/file';

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesS3Controller {
  constructor(private readonly filesService: FilesS3Service) {}

  @ApiCreatedResponse({
    type: FileResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.MulterS3.File,
  ): Promise<FileResponseDto> {
    return this.filesService.create(file);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('upload')
  async getUploadPresignedUrl(
    @Query('fileName') fileName: string,
  ): Promise<{ file: FileType; uploadSignedUrl: string }> {
    return this.filesService.getUploadPresignedUrl(fileName || 'file.bin');
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getDownloadSignedUrl(
    @Param('id') id: string,
  ): Promise<{ downloadSignedUrl: string }> {
    return this.filesService.getDownloadSignedUrl(id);
  }
}
