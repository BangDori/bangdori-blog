import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { entities } from '@database/entities';
import { ExternalPost, ExternalPostStatus } from '@database/entities/external-post.entity';
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
    await dataSource.query('TRUNCATE TABLE "external_posts" RESTART IDENTITY CASCADE');
  });

  async function seedExternalPost(overrides: Partial<ExternalPost> = {}): Promise<ExternalPost> {
    const post = rawRepository.create({
      title: 'External Title',
      url: `https://example.com/${Math.random().toString(36).slice(2, 10)}`,
      source: 'medium',
      category: 'tech',
      status: ExternalPostStatus.DRAFT,
      publishedAt: null,
      ...overrides,
    });
    return rawRepository.save(post);
  }

  describe('findAllForUser', () => {
    it('공개된 외부 글만 발행 시각 내림차순으로 조회한다', async () => {
      // given: 공개 전, 공개, 보관 상태의 외부 글이 섞여 있는 상태
      await seedExternalPost({
        url: 'https://e.com/draft',
        status: ExternalPostStatus.DRAFT,
        publishedAt: new Date('2026-04-01T00:00:00Z'),
      });
      const oldPublished = await seedExternalPost({
        url: 'https://e.com/published-old',
        status: ExternalPostStatus.PUBLISHED,
        publishedAt: new Date('2026-02-01T00:00:00Z'),
      });
      const newPublished = await seedExternalPost({
        url: 'https://e.com/published-new',
        status: ExternalPostStatus.PUBLISHED,
        publishedAt: new Date('2026-03-01T00:00:00Z'),
      });
      await seedExternalPost({
        url: 'https://e.com/archived',
        status: ExternalPostStatus.ARCHIVED,
        publishedAt: new Date('2026-05-01T00:00:00Z'),
      });

      // when: 공개 외부 글 목록을 조회한다
      const posts = await repository.findAllForUser();

      // then: 공개 상태의 외부 글만 최신 발행 순서로 반환한다
      expect(posts.map((post) => post.id)).toEqual([newPublished.id, oldPublished.id]);
    });
  });
});
