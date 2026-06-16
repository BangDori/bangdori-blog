import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalPostsCategory1781600000000 implements MigrationInterface {
  name = 'AddExternalPostsCategory1781600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "external_posts" ADD "category" varchar');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "external_posts" DROP COLUMN "category"');
  }
}
