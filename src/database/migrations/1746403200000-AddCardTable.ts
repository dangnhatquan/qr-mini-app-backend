import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCardTable1746403200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "card" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "editorStage" jsonb,
        "previewImageId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_card_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_card_previewImageId" FOREIGN KEY ("previewImageId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_card_previewImageId"`,
    );
    await queryRunner.query(`DROP TABLE "card"`);
  }
}
