import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQRRecordTable1776917753584 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "qr_record" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "userId" integer NOT NULL, 
                "category" character varying NOT NULL, 
                "type" character varying NOT NULL, 
                "slug" character varying, 
                "passwordHash" character varying, 
                "previewImageId" uuid, 
                "payload" jsonb, 
                "editorStage" jsonb, 
                "isDeleted" boolean NOT NULL DEFAULT false, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "deletedAt" TIMESTAMP, 
                CONSTRAINT "PK_qr_record_id" PRIMARY KEY ("id")
            )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_qr_record_userId" ON "qr_record" ("userId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_qr_record_slug" ON "qr_record" ("slug") WHERE "deletedAt" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "qr_record" ADD CONSTRAINT "FK_qr_record_previewImageId" FOREIGN KEY ("previewImageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qr_record" DROP CONSTRAINT "FK_qr_record_previewImageId"`,
    );
    await queryRunner.query(`DROP INDEX "UQ_qr_record_slug"`);
    await queryRunner.query(`DROP INDEX "IDX_qr_record_userId"`);
    await queryRunner.query(`DROP TABLE "qr_record"`);
  }
}
