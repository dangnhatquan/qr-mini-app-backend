import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AuthZaloService } from './auth-zalo.service';
import { AllConfigType } from '../config/config.type';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import { AuthZaloLoginDto } from './dto/login.dto';

@ApiTags('Auth with Zalo')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthZaloController {
  constructor(
    private readonly authZaloService: AuthZaloService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  @Post('zalo/login')
  @ApiOkResponse({ type: LoginResponseDto })
  @HttpCode(HttpStatus.OK)
  async loginWithZalo(
    @Body() dto: AuthZaloLoginDto,
  ): Promise<LoginResponseDto> {
    return this.authZaloService.handleZaloLogin(dto);
  }
}
