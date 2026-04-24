import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Request,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QRRecordsService } from './qr-records.service';
import { CreateQRRecordDto } from './dto/create-qr-record.dto';
import { QRRecord } from './domain/qr-record';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('QR Records')
@Controller({
  path: 'qrs',
  version: '1',
})
export class QRRecordsController {
  constructor(private readonly qrRecordsService: QRRecordsService) {}

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

  @ApiOkResponse({
    type: [QRRecord],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  findMyQRs(@Request() req): Promise<QRRecord[]> {
    return this.qrRecordsService.findQRRecordByUserId(String(req.user.id));
  }
}
