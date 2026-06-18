import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 외부 플랫폼(Medium / GitHub / Velog 등)에 발행한 글의 메타데이터
 *
 * hard delete 정책: posts와 달리 deleted_at 컬럼을 두지 않는다.
 * posts는 본인이 수기 입력한 내용이 우리 시스템에만 존재하는 원본이라 소실 시 복구를 위해 soft delete가 필요하지만,
 * external_posts는 원본이 이미 해당 외부 플랫폼에 보관되고 있어 레코드를 지워도 손실이 없다.
 */
@Entity({ name: 'external_posts' })
@Unique('UQ_external_posts_url', ['url'])
export class ExternalPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'varchar' })
  source!: string;

  @Column({ type: 'varchar' })
  category!: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
