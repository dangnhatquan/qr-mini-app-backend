import { MigrationInterface, QueryRunner } from 'typeorm';

export class MovePasswordHashToCard1777100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qr_record" DROP COLUMN "passwordHash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qr_record" ADD "hasPassword" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD "passwordHash" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "passwordHash"`);
    await queryRunner.query(
      `ALTER TABLE "qr_record" DROP COLUMN "hasPassword"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qr_record" ADD "passwordHash" character varying`,
    );
  }
}
