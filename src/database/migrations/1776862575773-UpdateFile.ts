import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFile1776862575773 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."file_status_enum" AS ENUM('pending', 'attached')`);
        await queryRunner.query(`ALTER TABLE "file" ADD "status" "public"."file_status_enum"`);
        await queryRunner.query(`ALTER TABLE "file" ADD "expiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "file" ADD "createdAt" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "file" ADD "updatedAt" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "file" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."file_status_enum"`);
    }

}
