import { Injectable, Logger } from '@nestjs/common';
import {
  VIETQR_API_BASE_URL,
  VIETQR_API_ENDPOINTS,
} from './constants/vietqr.constant';

@Injectable()
export class VietQRClient {
  private readonly logger = new Logger(VietQRClient.name);

  async getBanks(): Promise<any> {
    try {
      const url = `${VIETQR_API_BASE_URL}${VIETQR_API_ENDPOINTS.BANKS}`;
      this.logger.debug(`Fetching banks from ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `VietQR API error: ${response.status} ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      this.logger.error('Failed to get banks from VietQR', error);
      throw error;
    }
  }
}
