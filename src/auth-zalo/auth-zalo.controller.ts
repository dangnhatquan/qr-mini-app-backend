import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import ms from 'ms';
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
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const loginResponse = await this.authZaloService.validateZaloLogin(dto);
   
    const accessTokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
   
    res.cookie('access_token', loginResponse.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms(accessTokenExpiresIn),
      path: '/',
    });

    return loginResponse;
  }
}