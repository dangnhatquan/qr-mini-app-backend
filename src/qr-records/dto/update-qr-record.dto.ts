import { PartialType } from '@nestjs/swagger';
import { CreateQRRecordDto } from './create-qr-record.dto';

export class UpdateQRRecordDto extends PartialType(CreateQRRecordDto) {}
