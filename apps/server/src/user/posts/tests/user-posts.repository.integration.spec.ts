import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { entities } from '@database/entities';
import { Post, PostStatus } from '@database/entities/post.entity';
import { UserPostsRepository } from '@/user/posts/user-posts.repository';

describe('UserPostsRepository (integration)', () => {
  let dataSource: DataSource;
  let repository: UserPostsRepository;
  let rawRepository: Repository<Post>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: process.env.TEST_DATABASE_URL,
          entities,
          synchronize: false,
          installExtensions: false,
        }),
        TypeOrmModule.forFeature([Post]),
      ],
      providers: [UserPostsRepository],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    repository = moduleRef.get(UserPostsRepository);
    rawRepository = moduleRef.get<Repository<Post>>(getRepositoryToken(Post));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    // 각 테스트 격리: posts 테이블만 비운다.
    await dataSource.query('TRUNCATE TABLE "posts" RESTART IDENTITY CASCADE');
  });

  // published 행은 CHK_posts_published_requires_published_at 제약 때문에 published_at 이 항상 NOT NULL 이다.
  // 따라서 published_at 이 null 인 발행 글은 시드 자체가 불가능하며, 공개 조회의 NULLS LAST 절은 방어적 의미로만 둔다.
  async function seedPost(overrides: Partial<Post> = {}): Promise<Post> {
    const post = rawRepository.create({
      slug: `slug-${Math.random().toString(36).slice(2, 10)}`,
      title: 'Title',
      description: null,
      contentMdx: '# body',
      status: PostStatus.PUBLISHED,
      author: 'bangdori',
      category: 'dev',
      thumbnailUrl: null,
      publishedAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    });
    return rawRepository.save(post);
  }

  describe('findPublishedList', () => {
    it('발행되고 삭제되지 않은 글만 반환한다', async () => {
      // given: 살아있는 발행 글 + 초안/보관/삭제된 글을 각각 준비
      const published = await seedPost({
        slug: 'published-alive',
        status: PostStatus.PUBLISHED,
        publishedAt: new Date('2026-03-01T00:00:00Z'),
      });
      await seedPost({ slug: 'draft', status: PostStatus.DRAFT, publishedAt: null });
      await seedPost({ slug: 'archived', status: PostStatus.ARCHIVED, publishedAt: null });
      const deleted = await seedPost({
        slug: 'published-deleted',
        status: PostStatus.PUBLISHED,
        publishedAt: new Date('2026-03-02T00:00:00Z'),
      });
      await rawRepository.update(deleted.id, { deletedAt: new Date('2026-03-03T00:00:00Z') });

      // when: 공개 목록 조회
      const result = await repository.findPublishedList();

      // then: 살아있는 발행 글만 반환
      expect(result.map((post) => post.id)).toEqual([published.id]);
    });

    it('발행 시각 내림차순으로 정렬하고 같은 발행 시각은 작성 시각 내림차순으로 정렬한다', async () => {
      // given: 발행 시각이 서로 다른 글들과, 발행 시각이 같고 작성 시각만 다른 두 글을 준비
      await seedPost({
        slug: 'oldest',
        publishedAt: new Date('2026-01-01T00:00:00Z'),
        createdAt: new Date('2026-01-01T00:00:00Z'),
      });
      await seedPost({
        slug: 'newest',
        publishedAt: new Date('2026-03-01T00:00:00Z'),
        createdAt: new Date('2026-03-01T00:00:00Z'),
      });
      await seedPost({
        slug: 'tie-earlier',
        publishedAt: new Date('2026-02-01T00:00:00Z'),
        createdAt: new Date('2026-02-01T00:00:00Z'),
      });
      await seedPost({
        slug: 'tie-later',
        publishedAt: new Date('2026-02-01T00:00:00Z'),
        createdAt: new Date('2026-02-10T00:00:00Z'),
      });

      // when: 공개 목록 조회
      const result = await repository.findPublishedList();

      // then: 발행 시각 DESC, 동률은 작성 시각 DESC 순
      expect(result.map((post) => post.slug)).toEqual([
        'newest',
        'tie-later',
        'tie-earlier',
        'oldest',
      ]);
    });
  });

  describe('findPublishedBySlug', () => {
    it('발행되고 삭제되지 않은 글은 slug 로 반환한다', async () => {
      // given: 발행된 글 한 건
      const published = await seedPost({
        slug: 'find-me',
        status: PostStatus.PUBLISHED,
        publishedAt: new Date('2026-03-01T00:00:00Z'),
      });

      // when: slug 로 조회
      const result = await repository.findPublishedBySlug('find-me');

      // then: 해당 글이 반환된다
      expect(result?.id).toBe(published.id);
    });

    it.each([
      {
        label: '초안',
        overrides: { slug: 'draft-slug', status: PostStatus.DRAFT, publishedAt: null },
      },
      {
        label: '보관된 글',
        overrides: { slug: 'archived-slug', status: PostStatus.ARCHIVED, publishedAt: null },
      },
    ])('$label 은 slug 로 조회되지 않는다', async ({ overrides }) => {
      // given: 공개 대상이 아닌 글 한 건
      await seedPost(overrides);

      // when: 해당 slug 로 조회
      const result = await repository.findPublishedBySlug(overrides.slug);

      // then: 조회되지 않는다
      expect(result).toBeNull();
    });

    it('삭제된 발행 글은 slug 로 조회되지 않는다', async () => {
      // given: 발행되었지만 soft delete 된 글
      const deleted = await seedPost({
        slug: 'deleted-slug',
        status: PostStatus.PUBLISHED,
        publishedAt: new Date('2026-03-01T00:00:00Z'),
      });
      await rawRepository.update(deleted.id, { deletedAt: new Date('2026-03-03T00:00:00Z') });

      // when: 해당 slug 로 조회
      const result = await repository.findPublishedBySlug('deleted-slug');

      // then: 조회되지 않는다
      expect(result).toBeNull();
    });
  });
});
