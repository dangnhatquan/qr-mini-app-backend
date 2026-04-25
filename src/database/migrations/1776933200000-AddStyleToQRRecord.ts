import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStyleToQRRecord1776933200000 implements MigrationInterface {
  name = 'AddStyleToQRRecord1776933200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "qr_record" ADD "style" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "qr_record" DROP COLUMN "style"`);
  }
}
