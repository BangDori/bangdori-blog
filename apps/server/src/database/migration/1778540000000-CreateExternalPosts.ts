import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExternalPosts1778540000000 implements MigrationInterface {
  name = 'CreateExternalPosts1778540000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "external_posts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "url" text NOT NULL,
        "source" varchar NOT NULL,
        "published_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_external_posts_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_external_posts_url" UNIQUE ("url")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "external_posts"');
  }
}
