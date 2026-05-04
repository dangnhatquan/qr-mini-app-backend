import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthZaloLoginDto {
  @ApiProperty({
    description: 'Zalo access token obtained from zmp-sdk getAccessToken()',
    example: 'abc123...',
  })
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}