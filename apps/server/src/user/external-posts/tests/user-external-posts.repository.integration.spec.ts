import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { entities } from '@database/entities';
import { ExternalPost } from '@database/entities/external-post.entity';
import { UserExternalPostsRepository } from '@/user/external-posts/user-external-posts.repository';

describe('UserExternalPostsRepository (integration)', () => {
  let dataSource: DataSource;
  let repository: UserExternalPostsRepository;
  let rawRepository: Repository<ExternalPost>;

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
        TypeOrmModule.forFeature([ExternalPost]),
      ],
      providers: [UserExternalPostsRepository],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    repository = moduleRef.get(UserExternalPostsRepository);
    rawRepository = moduleRef.get<Repository<ExternalPost>>(getRepositoryToken(ExternalPost));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    // 각 테스트 격리: external_posts 테이블만 비운다.
    await dataSource.query('TRUNCATE TABLE "external_posts" RESTART IDENTITY CASCADE');
  });

  async function seedExternalPost(overrides: Partial<ExternalPost> = {}): Promise<ExternalPost> {
    const post = rawRepository.create({
      title: 'External Title',
      url: `https://example.com/${Math.random().toString(36).slice(2, 10)}`,
      source: 'medium',
      category: 'tech',
      publishedAt: null,
      ...overrides,
    });
    return rawRepository.save(post);
  }

  describe('findAllForUser', () => {
    it('외부 글이 없으면 빈 목록을 반환한다', async () => {
      // given: 외부 글이 없는 상태

      // when: 전체 외부 글 조회
      const result = await repository.findAllForUser();

      // then: 빈 목록이 반환된다
      expect(result).toEqual([]);
    });

    it('저장된 외부 글을 모두 반환한다', async () => {
      // given: 외부 글 세 건이 저장된 상태
      const first = await seedExternalPost({ url: 'https://example.com/first' });
      const second = await seedExternalPost({ url: 'https://example.com/second' });
      const third = await seedExternalPost({ url: 'https://example.com/third' });

      // when: 전체 외부 글 조회
      const result = await repository.findAllForUser();

      // then: 저장된 외부 글이 빠짐없이 반환된다
      expect(new Set(result.map((post) => post.id))).toEqual(
        new Set([first.id, second.id, third.id]),
      );
    });

    it('저장된 외부 글의 메타데이터를 로드한다', async () => {
      // given: 공개 목록에 필요한 외부 글 메타데이터가 저장된 상태
      await seedExternalPost({
        title: 'Loaded External Post',
        url: 'https://example.com/loaded',
        source: 'Medium',
        category: '회고',
        publishedAt: new Date('2026-05-01T00:00:00Z'),
        createdAt: new Date('2026-04-01T00:00:00Z'),
        updatedAt: new Date('2026-04-02T00:00:00Z'),
      });

      // when: 전체 외부 글 조회
      const result = await repository.findAllForUser();

      // then: 엔티티의 공개 메타데이터가 로드된다
      expect(result[0]).toMatchObject({
        title: 'Loaded External Post',
        url: 'https://example.com/loaded',
        source: 'Medium',
        category: '회고',
        publishedAt: new Date('2026-05-01T00:00:00.000Z'),
      });
      expect(result[0]?.id).toEqual(expect.any(String));
      expect(result[0]?.createdAt).toEqual(expect.any(Date));
      expect(result[0]?.updatedAt).toEqual(expect.any(Date));
    });

    it('발행 시각 내림차순으로 정렬하고 발행 시각이 없으면 작성 시각 내림차순으로 뒤에 둔다', async () => {
      // given: 발행 시각이 있는 글들과 없는 글들을 섞어 저장
      await seedExternalPost({
        url: 'https://example.com/oldest',
        publishedAt: new Date('2026-01-01T00:00:00Z'),
        createdAt: new Date('2026-01-01T00:00:00Z'),
      });
      await seedExternalPost({
        url: 'https://example.com/newest',
        publishedAt: new Date('2026-03-01T00:00:00Z'),
        createdAt: new Date('2026-03-01T00:00:00Z'),
      });
      await seedExternalPost({
        url: 'https://example.com/tie-earlier',
        publishedAt: new Date('2026-02-01T00:00:00Z'),
        createdAt: new Date('2026-02-01T00:00:00Z'),
      });
      await seedExternalPost({
        url: 'https://example.com/tie-later',
        publishedAt: new Date('2026-02-01T00:00:00Z'),
        createdAt: new Date('2026-02-10T00:00:00Z'),
      });
      await seedExternalPost({
        url: 'https://example.com/null-earlier',
        publishedAt: null,
        createdAt: new Date('2026-04-01T00:00:00Z'),
      });
      await seedExternalPost({
        url: 'https://example.com/null-later',
        publishedAt: null,
        createdAt: new Date('2026-04-02T00:00:00Z'),
      });

      // when: 전체 외부 글 조회
      const result = await repository.findAllForUser();

      // then: 발행 시각 DESC NULLS LAST, 동률은 작성 시각 DESC 순이다
      expect(result.map((post) => post.url)).toEqual([
        'https://example.com/newest',
        'https://example.com/tie-later',
        'https://example.com/tie-earlier',
        'https://example.com/oldest',
        'https://example.com/null-later',
        'https://example.com/null-earlier',
      ]);
    });
  });
});
