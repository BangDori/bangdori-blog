import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ExternalPost } from '@database/entities/external-post.entity';
import { UserExternalPostsRepository } from '@/user/external-posts/user-external-posts.repository';

describe('UserExternalPostsRepository (integration)', () => {
  let dataSource: DataSource;
  let repository: UserExternalPostsRepository;
  let rawRepository: Repository<ExternalPost>;
  let sequence = 0;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: process.env.TEST_DATABASE_URL,
          entities: [ExternalPost],
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
    await dataSource.query('TRUNCATE TABLE "external_posts" RESTART IDENTITY CASCADE');
  });

  async function seedExternalPost(overrides: Partial<ExternalPost> = {}): Promise<ExternalPost> {
    sequence += 1;

    const post = rawRepository.create({
      title: `External Title ${sequence}`,
      url: `https://example.com/external-${sequence}`,
      source: 'medium',
      category: 'tech',
      publishedAt: null,
      ...overrides,
    });
    return rawRepository.save(post);
  }

  describe('findAllForUser', () => {
    it('외부 글이 없으면 빈 목록을 반환한다', async () => {
      // given: 외부 글 테이블이 비어 있는 상태

      // when: 공개 외부 글 목록 조회
      const result = await repository.findAllForUser();

      // then: 빈 배열을 반환한다
      expect(result).toEqual([]);
    });

    it('발행 시각이 있는 외부 글은 발행 시각이 최신인 순서로 반환한다', async () => {
      // given: 발행 시각이 서로 다른 외부 글들
      await seedExternalPost({
        title: 'oldest',
        publishedAt: new Date('2026-01-01T00:00:00Z'),
        createdAt: new Date('2026-01-01T00:00:00Z'),
      });
      await seedExternalPost({
        title: 'newest',
        publishedAt: new Date('2026-03-01T00:00:00Z'),
        createdAt: new Date('2026-03-01T00:00:00Z'),
      });
      await seedExternalPost({
        title: 'middle',
        publishedAt: new Date('2026-02-01T00:00:00Z'),
        createdAt: new Date('2026-02-01T00:00:00Z'),
      });

      // when: 공개 외부 글 목록 조회
      const result = await repository.findAllForUser();

      // then: 발행 시각 내림차순으로 반환한다
      expect(result.map((post) => post.title)).toEqual(['newest', 'middle', 'oldest']);
    });

    it('발행 시각이 같으면 작성 시각이 최신인 순서로 반환한다', async () => {
      // given: 발행 시각이 같고 작성 시각만 다른 외부 글들
      await seedExternalPost({
        title: 'created-earlier',
        publishedAt: new Date('2026-02-01T00:00:00Z'),
        createdAt: new Date('2026-02-01T00:00:00Z'),
      });
      await seedExternalPost({
        title: 'created-later',
        publishedAt: new Date('2026-02-01T00:00:00Z'),
        createdAt: new Date('2026-02-10T00:00:00Z'),
      });

      // when: 공개 외부 글 목록 조회
      const result = await repository.findAllForUser();

      // then: 작성 시각 내림차순으로 반환한다
      expect(result.map((post) => post.title)).toEqual(['created-later', 'created-earlier']);
    });

    it('발행 시각이 없는 외부 글도 포함하되 발행 시각이 있는 글 뒤에 반환한다', async () => {
      // given: 발행 시각이 있는 외부 글과 발행 시각이 없는 외부 글
      await seedExternalPost({
        title: 'without-published-at',
        publishedAt: null,
        createdAt: new Date('2026-04-01T00:00:00Z'),
      });
      await seedExternalPost({
        title: 'with-published-at',
        publishedAt: new Date('2026-01-01T00:00:00Z'),
        createdAt: new Date('2026-01-01T00:00:00Z'),
      });

      // when: 공개 외부 글 목록 조회
      const result = await repository.findAllForUser();

      // then: 발행 시각이 없는 글은 제외되지 않고 뒤에 놓인다
      expect(result.map((post) => post.title)).toEqual([
        'with-published-at',
        'without-published-at',
      ]);
    });
  });
});
