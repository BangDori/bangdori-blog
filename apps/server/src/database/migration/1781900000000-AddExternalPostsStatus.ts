import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalPostsStatus1781900000000 implements MigrationInterface {
  name = 'AddExternalPostsStatus1781900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"external_posts_status_enum\" AS ENUM ('draft', 'published', 'archived')",
    );

    await queryRunner.query(
      'ALTER TABLE "external_posts" ADD "status" "external_posts_status_enum"',
    );
    await queryRunner.query(`
      UPDATE "external_posts"
      SET
        "status" = 'published',
        "published_at" = COALESCE("published_at", "created_at")
    `);
    await queryRunner.query(
      'ALTER TABLE "external_posts" ALTER COLUMN "status" SET DEFAULT \'draft\'',
    );
    await queryRunner.query('ALTER TABLE "external_posts" ALTER COLUMN "status" SET NOT NULL');
    await queryRunner.query(`
      ALTER TABLE "external_posts"
      ADD CONSTRAINT "CHK_external_posts_published_requires_published_at"
      CHECK ("status" <> 'published' OR "published_at" IS NOT NULL)
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_external_posts_status_published_at" ON "external_posts" ("status", "published_at")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_external_posts_status_published_at"');
    await queryRunner.query(
      'ALTER TABLE "external_posts" DROP CONSTRAINT IF EXISTS "CHK_external_posts_published_requires_published_at"',
    );
    await queryRunner.query('ALTER TABLE "external_posts" DROP COLUMN IF EXISTS "status"');
    await queryRunner.query('DROP TYPE IF EXISTS "external_posts_status_enum"');
  }
}
