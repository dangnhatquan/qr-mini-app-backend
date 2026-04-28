import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Request,
  Get,
  Patch,
  Param,
  NotFoundException,
  Delete,
  Redirect,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QRRecordsService } from './qr-records.service';
import { CreateQRRecordDto } from './dto/create-qr-record.dto';
import { UpdateQRRecordDto } from './dto/update-qr-record.dto';
import { QRRecord } from './domain/qr-record';

@ApiTags('QR Records')
@Controller({
  path: 'qrs',
  version: '1',
})
export class QRRecordsController {
  constructor(private readonly qrRecordsService: QRRecordsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({
    type: QRRecord,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createQRRecordDto: CreateQRRecordDto,
    @Request() req,
  ): Promise<QRRecord> {
    return this.qrRecordsService.create(createQRRecordDto, String(req.user.id));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: [QRRecord],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  findMyQRs(@Request() req): Promise<QRRecord[]> {
    return this.qrRecordsService.findQRRecordByUserId(String(req.user.id));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: QRRecord,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<QRRecord> {
    const record = await this.qrRecordsService.findOne(id);
    if (!record) {
      throw new NotFoundException('QR Record not found');
    }
    return record;
  }

  @ApiOkResponse({
    type: QRRecord,
  })
  @ApiParam({
    name: 'slug',
    type: String,
    required: true,
  })
  @Get('slug/:slug')
  @Redirect()
  async findBySlug(@Param('slug') slug: string) {
    const url = await this.qrRecordsService.getRedirectUrlBySlug(slug);
    return {
      url,
      statusCode: HttpStatus.FOUND,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: QRRecord,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateQRRecordDto: UpdateQRRecordDto,
  ): Promise<QRRecord | null> {
    return this.qrRecordsService.update(id, updateQRRecordDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    const record = await this.qrRecordsService.findOne(id);
    if (!record) {
      throw new NotFoundException('QR Record not found');
    }
    return this.qrRecordsService.remove(id);
  }
}
