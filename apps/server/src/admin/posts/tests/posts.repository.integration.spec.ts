import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { PostsRepository } from '@admin/posts/posts.repository';
import { entities } from '@database/entities';
import { Post, PostStatus } from '@database/entities/post.entity';

describe('PostsRepository (integration)', () => {
  let dataSource: DataSource;
  let repository: PostsRepository;
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
      providers: [PostsRepository],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    repository = moduleRef.get(PostsRepository);
    rawRepository = moduleRef.get<Repository<Post>>(getRepositoryToken(Post));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    // 각 테스트 격리: posts 테이블만 비운다.
    await dataSource.query('TRUNCATE TABLE "posts" RESTART IDENTITY CASCADE');
  });

  async function seedPost(overrides: Partial<Post> = {}): Promise<Post> {
    const post = rawRepository.create({
      slug: `slug-${Math.random().toString(36).slice(2, 10)}`,
      title: 'Title',
      description: null,
      contentMdx: '# body',
      status: PostStatus.DRAFT,
      author: 'bangdori',
      category: 'dev',
      thumbnailUrl: null,
      publishedAt: null,
      ...overrides,
    });
    return rawRepository.save(post);
  }

  describe('save / findById', () => {
    it('사용자 입력 필드만 주고 저장하면 시스템 필드가 디폴트로 채워진 상태로 findById로 조회된다', async () => {
      // given: 사용자가 작성한 필드만 준비
      const input = {
        slug: 'first-post',
        title: '첫 글',
        description: '첫 글 설명',
        contentMdx: '# 본문',
        author: 'bangdori',
        category: 'tech',
        thumbnailUrl: 'https://example.com/thumb.png',
      };

      // when
      const saved = await rawRepository.save(rawRepository.create(input));
      const found = await repository.findById(saved.id);

      // then
      expect(found).toEqual({
        slug: 'first-post',
        title: '첫 글',
        description: '첫 글 설명',
        contentMdx: '# 본문',
        author: 'bangdori',
        category: 'tech',
        thumbnailUrl: 'https://example.com/thumb.png',
        id: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
        status: PostStatus.DRAFT,
        viewCount: '0',
        publishedAt: null,
        deletedAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('findAll', () => {
    it('삭제되지 않은 행만 반환한다', async () => {
      // given: 살아있는 글 1개 + soft delete된 글 1개
      const alive = await seedPost({ slug: 'alive' });
      const deleted = await seedPost({ slug: 'deleted' });
      await repository.softDeleteById(deleted.id);

      // when: 조건 없이 전체 조회
      const all = await repository.findAll();

      // then: deleted_at IS NULL 인 행만 반환
      expect(all.map((p) => p.id)).toEqual([alive.id]);
    });

    it('status가 draft인 행만 반환한다', async () => {
      // given: 세 상태(draft/published/archived) 각각 1개씩 준비
      const draft = await seedPost({ slug: 'd', status: PostStatus.DRAFT });
      await seedPost({
        slug: 'p',
        status: PostStatus.PUBLISHED,
        publishedAt: new Date('2026-03-01T00:00:00Z'),
      });
      await seedPost({ slug: 'a', status: PostStatus.ARCHIVED });

      // when: status=DRAFT 필터로 조회
      const drafts = await repository.findAll(PostStatus.DRAFT);

      // then: draft 글만 반환
      expect(drafts.map((p) => p.id)).toEqual([draft.id]);
    });

    it('status가 published인 행만 반환한다', async () => {
      // given: 세 상태(draft/published/archived) 각각 1개씩 준비
      await seedPost({ slug: 'd', status: PostStatus.DRAFT });
      const published = await seedPost({
        slug: 'p',
        status: PostStatus.PUBLISHED,
        publishedAt: new Date('2026-03-01T00:00:00Z'),
      });
      await seedPost({ slug: 'a', status: PostStatus.ARCHIVED });

      // when: status=PUBLISHED 필터로 조회
      const publisheds = await repository.findAll(PostStatus.PUBLISHED);

      // then: published 글만 반환
      expect(publisheds.map((p) => p.id)).toEqual([published.id]);
    });

    it('발행 시각 내림차순으로 정렬되며 미발행 글은 가장 뒤에서 작성 시각 내림차순으로 정렬된다', async () => {
      // given: 의도적으로 createdAt을 다르게 만들고 publishedAt도 섞는다
      const p1 = await seedPost({
        slug: 's1',
        publishedAt: new Date('2026-01-01T00:00:00Z'),
      });
      const p2 = await seedPost({
        slug: 's2',
        publishedAt: new Date('2026-03-01T00:00:00Z'),
      });
      const p3 = await seedPost({ slug: 's3', publishedAt: null });
      const p4 = await seedPost({
        slug: 's4',
        publishedAt: new Date('2026-02-01T00:00:00Z'),
      });
      const p5 = await seedPost({ slug: 's5', publishedAt: null });

      // when
      const all = await repository.findAll();

      // then
      expect(all.map((p) => p.slug)).toEqual(['s2', 's4', 's1', 's5', 's3']);
      expect(new Set(all.map((p) => p.id))).toEqual(new Set([p1.id, p2.id, p3.id, p4.id, p5.id]));
    });
  });

  describe('softDeleteById', () => {
    it('삭제일자만 갱신되고 실제 행은 제거되지 않는다', async () => {
      // given: 삭제 전에는 deletedAt이 null
      const post = await seedPost({
        slug: 'soft-target',
        title: 'Soft Target',
        status: PostStatus.PUBLISHED,
        publishedAt: new Date('2026-04-01T00:00:00Z'),
      });
      expect(post.deletedAt).toBeNull();

      // when
      await repository.softDeleteById(post.id);

      // then: 삭제 후에는 deletedAt이 Date이며 행은 그대로 존재
      const raw = await rawRepository.findOne({ where: { id: post.id, deletedAt: Not(IsNull()) } });
      expect(raw).not.toBeNull();
      expect(raw?.deletedAt).toBeInstanceOf(Date);
    });

    it('삭제된 행은 findById로 조회되지 않는다', async () => {
      // given: 살아있는 글 1개
      const post = await seedPost({ slug: 'gone' });

      // when: soft delete 수행
      await repository.softDeleteById(post.id);

      // then: findById는 deleted_at IS NULL 조건이 걸려 null 반환
      const found = await repository.findById(post.id);
      expect(found).toBeNull();
    });
  });

  describe('unique constraint', () => {
    it('동일 slug를 두 번 저장하려는 경우 에러가 발생한다', async () => {
      // given: 특정 slug로 글 1개 저장
      await seedPost({ slug: 'unique-slug' });

      // when & then: 동일 slug 재저장 시 UNIQUE 제약 위반 에러
      await expect(seedPost({ slug: 'unique-slug' })).rejects.toThrow();
    });
  });
});
