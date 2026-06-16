import { Test } from '@nestjs/testing';
import { ExternalPost } from '@database/entities/external-post.entity';
import { UserExternalPostsRepository } from '@/user/external-posts/user-external-posts.repository';
import { UserExternalPostsService } from '@/user/external-posts/user-external-posts.service';

type UserExternalPostsRepositoryMock = {
  [K in keyof UserExternalPostsRepository]: jest.Mock;
};

function createRepositoryMock(): UserExternalPostsRepositoryMock {
  return {
    findAllForUser: jest.fn(),
  };
}

function makeExternalPost(overrides: Partial<ExternalPost> = {}): ExternalPost {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'External Title',
    url: 'https://medium.com/@bangdori/post',
    source: 'medium',
    category: 'tech',
    publishedAt: new Date('2026-03-01T12:00:00Z'),
    createdAt: new Date('2026-02-01T00:00:00Z'),
    updatedAt: new Date('2026-02-02T00:00:00Z'),
    ...overrides,
  };
}

describe('UserExternalPostsService', () => {
  let service: UserExternalPostsService;
  let repository: UserExternalPostsRepositoryMock;

  beforeEach(async () => {
    repository = createRepositoryMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserExternalPostsService,
        {
          provide: UserExternalPostsRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = moduleRef.get(UserExternalPostsService);
  });

  describe('findAll', () => {
    it('외부 글을 공개 목록 형태로 변환해 응답한다', async () => {
      // given: 날짜 메타데이터가 채워진 외부 글 한 건
      const post = makeExternalPost({
        id: '22222222-2222-2222-2222-222222222222',
        title: 'Published Elsewhere',
        url: 'https://example.com/published-elsewhere',
        source: 'medium',
        category: 'tech',
        publishedAt: new Date('2026-03-01T12:00:00Z'),
        createdAt: new Date('2026-02-01T00:00:00Z'),
        updatedAt: new Date('2026-02-02T00:00:00Z'),
      });
      repository.findAllForUser.mockResolvedValue([post]);

      // when: 공개 외부 글 목록 조회
      const result = await service.findAll();

      // then: 공개 필드만 노출되고 시간은 ISO8601 문자열로 직렬화된다
      expect(result).toEqual([
        {
          id: '22222222-2222-2222-2222-222222222222',
          title: 'Published Elsewhere',
          url: 'https://example.com/published-elsewhere',
          source: 'medium',
          category: 'tech',
          publishedAt: '2026-03-01T12:00:00.000Z',
          createdAt: '2026-02-01T00:00:00.000Z',
          updatedAt: '2026-02-02T00:00:00.000Z',
        },
      ]);
    });

    it('발행 시각이 없으면 null로 응답한다', async () => {
      // given: 발행 시각이 없는 외부 글 한 건
      const post = makeExternalPost({ publishedAt: null });
      repository.findAllForUser.mockResolvedValue([post]);

      // when: 공개 외부 글 목록 조회
      const result = await service.findAll();

      // then: 발행 시각은 null로 유지된다
      expect(result[0]?.publishedAt).toBeNull();
    });

    it('카테고리가 있으면 그대로 응답한다', async () => {
      // given: 카테고리가 있는 외부 글 한 건
      const post = makeExternalPost({ category: '회고' });
      repository.findAllForUser.mockResolvedValue([post]);

      // when: 공개 외부 글 목록 조회
      const result = await service.findAll();

      // then: 외부 글 분류를 응답에 포함한다
      expect(result[0]?.category).toBe('회고');
    });

    it('카테고리가 없으면 null로 응답한다', async () => {
      // given: 카테고리가 없는 외부 글 한 건
      const post = makeExternalPost({ category: null });
      repository.findAllForUser.mockResolvedValue([post]);

      // when: 공개 외부 글 목록 조회
      const result = await service.findAll();

      // then: 외부 글 분류는 null로 유지된다
      expect(result[0]?.category).toBeNull();
    });
  });
});
