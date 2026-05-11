import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity({ name: 'posts' })
@Unique('UQ_posts_slug', ['slug'])
@Index('IDX_posts_status_published_at', ['status', 'publishedAt'])
@Check(
  'CHK_posts_published_requires_published_at',
  `"status" <> 'published' OR "published_at" IS NOT NULL`,
)
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  slug!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'content_mdx', type: 'text' })
  contentMdx!: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    enumName: 'posts_status_enum',
    default: PostStatus.DRAFT,
  })
  status!: PostStatus;

  @Column({ type: 'varchar' })
  author!: string;

  @Column({ type: 'varchar' })
  category!: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl!: string | null;

  @Column({ name: 'view_count', type: 'bigint', default: 0 })
  viewCount!: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
