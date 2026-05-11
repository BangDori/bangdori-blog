import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePosts1778509265000 implements MigrationInterface {
  name = 'CreatePosts1778509265000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(
      "CREATE TYPE \"posts_status_enum\" AS ENUM ('draft', 'published', 'archived')",
    );

    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" varchar NOT NULL,
        "title" varchar NOT NULL,
        "description" text,
        "content_mdx" text NOT NULL,
        "status" "posts_status_enum" NOT NULL DEFAULT 'draft',
        "author" varchar NOT NULL,
        "category" varchar NOT NULL,
        "thumbnail_url" text,
        "published_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_posts_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_posts_slug" UNIQUE ("slug"),
        CONSTRAINT "CHK_posts_published_requires_published_at" CHECK ("status" <> 'published' OR "published_at" IS NOT NULL)
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_posts_status_published_at" ON "posts" ("status", "published_at")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "posts"');
    await queryRunner.query('DROP TYPE IF EXISTS "posts_status_enum"');
  }
}
