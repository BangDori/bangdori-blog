import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ExternalPostsRepository } from '@admin/external-posts/external-posts.repository';
import { entities } from '@database/entities';
import { ExternalPost } from '@database/entities/external-post.entity';

describe('ExternalPostsRepository (integration)', () => {
  let dataSource: DataSource;
  let repository: ExternalPostsRepository;
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
      providers: [ExternalPostsRepository],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    repository = moduleRef.get(ExternalPostsRepository);
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
      publishedAt: null,
      ...overrides,
    });
    return rawRepository.save(post);
  }

  describe('save / findById', () => {
    it('필수 필드만 주고 저장하면 created_at/updated_at이 자동 채워진다', async () => {
      const input = {
        title: 'Hello World on Medium',
        url: 'https://medium.com/@bangdori/hello-world',
        source: 'medium',
      };

      const saved = await rawRepository.save(rawRepository.create(input));
      const found = await repository.findById(saved.id);

      expect(found).toEqual({
        id: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
        title: 'Hello World on Medium',
        url: 'https://medium.com/@bangdori/hello-world',
        source: 'medium',
        publishedAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('updated_at은 행을 수정하면 갱신된다', async () => {
      const post = await seedExternalPost({ title: 'before' });
      const before = post.updatedAt;

      await new Promise((r) => setTimeout(r, 20));
      await rawRepository.update(post.id, { title: 'after' });

      const reloaded = await repository.findById(post.id);
      expect(reloaded?.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });
  });

  describe('findAll', () => {
    it('published_at DESC NULLS LAST, created_at DESC 순으로 정렬한다', async () => {
      const p1 = await seedExternalPost({
        url: 'https://e.com/1',
        publishedAt: new Date('2026-01-01T00:00:00Z'),
        createdAt: new Date('2026-01-01T00:00:00Z'),
      });
      const p2 = await seedExternalPost({
        url: 'https://e.com/2',
        publishedAt: new Date('2026-03-01T00:00:00Z'),
        createdAt: new Date('2026-03-01T00:00:00Z'),
      });
      const p3 = await seedExternalPost({
        url: 'https://e.com/3',
        publishedAt: null,
        createdAt: new Date('2026-04-01T00:00:00Z'),
      });
      const p4 = await seedExternalPost({
        url: 'https://e.com/4',
        publishedAt: new Date('2026-02-01T00:00:00Z'),
        createdAt: new Date('2026-02-01T00:00:00Z'),
      });
      const p5 = await seedExternalPost({
        url: 'https://e.com/5',
        publishedAt: null,
        createdAt: new Date('2026-04-02T00:00:00Z'),
      });

      const all = await repository.findAll();

      expect(all.map((p) => p.url)).toEqual([
        'https://e.com/2',
        'https://e.com/4',
        'https://e.com/1',
        'https://e.com/5',
        'https://e.com/3',
      ]);
      expect(new Set(all.map((p) => p.id))).toEqual(new Set([p1.id, p2.id, p3.id, p4.id, p5.id]));
    });
  });

  describe('unique constraint', () => {
    it('동일 url을 두 번 저장하면 UNIQUE 위반 에러가 난다', async () => {
      await seedExternalPost({ url: 'https://dup.com/x' });
      await expect(seedExternalPost({ url: 'https://dup.com/x' })).rejects.toThrow();
    });
  });

  describe('deleteById', () => {
    it('hard delete 시 row가 실제로 제거된다', async () => {
      const post = await seedExternalPost({ url: 'https://gone.com/x' });

      await repository.deleteById(post.id);

      const reloaded = await rawRepository.findOne({ where: { id: post.id } });
      expect(reloaded).toBeNull();
    });
  });
});
