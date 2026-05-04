import { Injectable } from '@nestjs/common';
import { VietQRClient } from './vietqr.client';
import { BankDto } from './dto/bank.dto';

@Injectable()
export class BanksService {
  constructor(private readonly vietQrClient: VietQRClient) {}

  async getBanks(): Promise<BankDto[]> {
    const response = await this.vietQrClient.getBanks();
    if (response && response.data) {
      return response.data;
    }
    return [];
  }
}
