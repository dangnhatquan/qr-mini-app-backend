import { registerAs } from '@nestjs/config';

import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { ZaloConfig } from './zalo-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  ZALO_APP_ID: string;

  @IsString()
  @IsOptional()
  ZALO_APP_SECRET: string;

  @IsString()
  @IsOptional()
  ZALO_API_URL: string;

  @IsString()
  @IsOptional()
  ZALO_APP_DEV_VERSION: string;
}

export default registerAs<ZaloConfig>('zalo', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    devVersion: process.env.ZALO_APP_DEV_VERSION,
    appId: process.env.ZALO_APP_ID,
    appSecret: process.env.ZALO_APP_SECRET,
    apiUrl: process.env.ZALO_API_URL,
  };
});
