import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { entities } from '@database/entities';
import { ExternalPost } from '@database/entities/external-post.entity';
import { UserExternalPostsModule } from '@/user/external-posts/user-external-posts.module';

describe('UserExternalPostsController (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
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
        UserExternalPostsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = moduleRef.get(DataSource);
    rawRepository = moduleRef.get<Repository<ExternalPost>>(getRepositoryToken(ExternalPost));
  });

  afterAll(async () => {
    await app.close();
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

  describe('GET /user/external-posts', () => {
    it('인증 없이 요청하면 공개 외부 글 목록을 응답한다', async () => {
      // given: 공개할 외부 글 한 건이 저장된 상태
      const post = await seedExternalPost({
        title: 'External Public Post',
        url: 'https://example.com/public-post',
        source: 'medium',
        category: 'tech',
        publishedAt: new Date('2026-03-01T12:00:00Z'),
        createdAt: new Date('2026-02-01T00:00:00Z'),
        updatedAt: new Date('2026-02-02T00:00:00Z'),
      });

      // when: 인증 정보 없이 공개 외부 글 목록 조회
      const response = await request(app.getHttpServer()).get('/user/external-posts');

      // then: 공개 계약 필드만 담긴 목록을 응답한다
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          id: post.id,
          title: 'External Public Post',
          url: 'https://example.com/public-post',
          source: 'medium',
          category: 'tech',
          publishedAt: '2026-03-01T12:00:00.000Z',
          createdAt: '2026-02-01T00:00:00.000Z',
          updatedAt: '2026-02-02T00:00:00.000Z',
        },
      ]);
      expect(Object.keys(response.body[0]).sort()).toEqual([
        'category',
        'createdAt',
        'id',
        'publishedAt',
        'source',
        'title',
        'updatedAt',
        'url',
      ]);
    });

    it('외부 글이 없으면 빈 목록을 응답한다', async () => {
      // given: 외부 글이 없는 상태

      // when: 공개 외부 글 목록 조회
      const response = await request(app.getHttpServer()).get('/user/external-posts');

      // then: 요청은 허용되고 빈 배열을 응답한다
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
