import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { BanksService } from './banks.service';
import { BankDto } from './dto/bank.dto';

@ApiTags('Banks')
@Controller({
  path: 'banks',
  version: '1',
})
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @ApiOkResponse({
    type: [BankDto],
    description: 'Get list of banks',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getBanks(): Promise<BankDto[]> {
    return this.banksService.getBanks();
  }
}
