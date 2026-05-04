import { ApiProperty } from '@nestjs/swagger';

export class BankDto {
  @ApiProperty({ example: 17 })
  id: number;

  @ApiProperty({ example: 'Ngân hàng TMCP Công thương Việt Nam' })
  name: string;

  @ApiProperty({ example: 'ICB' })
  code: string;

  @ApiProperty({ example: '970415' })
  bin: string;

  @ApiProperty({ example: 'VietinBank' })
  shortName: string;

  @ApiProperty({ example: 'https://cdn.vietqr.io/img/ICB.png' })
  logo: string;

  @ApiProperty({ example: 1 })
  transferSupported: number;

  @ApiProperty({ example: 1 })
  lookupSupported: number;

  @ApiProperty({ example: 'VietinBank' })
  short_name: string;

  @ApiProperty({ example: 3 })
  support: number;

  @ApiProperty({ example: 1 })
  isTransfer: number;

  @ApiProperty({ example: 'ICBVVNVX', nullable: true })
  swift_code: string | null;
}
