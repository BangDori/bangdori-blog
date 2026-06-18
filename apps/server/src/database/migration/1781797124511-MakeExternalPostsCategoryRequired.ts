import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeExternalPostsCategoryRequired1781797124511 implements MigrationInterface {
  name = 'MakeExternalPostsCategoryRequired1781797124511';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "external_posts" SET "category" = 'tech' WHERE "category" IS NULL`,
    );
    await queryRunner.query('ALTER TABLE "external_posts" ALTER COLUMN "category" SET NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "external_posts" ALTER COLUMN "category" DROP NOT NULL');
  }
}
