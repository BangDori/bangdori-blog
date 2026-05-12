import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostsDeletedAt1778526000000 implements MigrationInterface {
  name = 'AddPostsDeletedAt1778526000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "posts" ADD "deleted_at" timestamptz');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "posts" DROP COLUMN "deleted_at"');
  }
}
