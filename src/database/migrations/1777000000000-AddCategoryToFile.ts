import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToFile1777000000000 implements MigrationInterface {
  name = 'AddCategoryToFile1777000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."file_category_enum" AS ENUM('sticker', 'qr')`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD "category" "public"."file_category_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "category"`);
    await queryRunner.query(`DROP TYPE "public"."file_category_enum"`);
  }
}
