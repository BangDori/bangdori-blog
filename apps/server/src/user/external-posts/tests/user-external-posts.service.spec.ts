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
    it('외부 글이 없으면 빈 목록을 응답한다', async () => {
      // given: 저장소가 빈 목록을 돌려준 상태
      repository.findAllForUser.mockResolvedValue([]);

      // when: 공개 외부 글 목록 조회
      const result = await service.findAll();

      // then: 빈 배열을 그대로 응답한다
      expect(result).toEqual([]);
      expect(repository.findAllForUser).toHaveBeenCalledTimes(1);
    });

    it('저장소가 돌려준 순서 그대로 공개 목록을 전달한다', async () => {
      // given: 저장소가 정렬을 끝낸 외부 글 목록을 돌려준 상태
      const first = makeExternalPost({ id: '11111111-1111-1111-1111-111111111111' });
      const second = makeExternalPost({ id: '22222222-2222-2222-2222-222222222222' });
      const third = makeExternalPost({ id: '33333333-3333-3333-3333-333333333333' });
      repository.findAllForUser.mockResolvedValue([first, second, third]);

      // when: 공개 외부 글 목록 조회
      const result = await service.findAll();

      // then: 저장소가 정한 순서가 응답에서도 보존된다
      expect(result.map((item) => item.id)).toEqual([first.id, second.id, third.id]);
    });

    it('외부 글을 조회하면 공개 필드만 날짜 문자열로 변환해 응답한다', async () => {
      // given: 공개 API에 노출하지 않는 내부 성격의 값이 함께 붙은 외부 글
      const post = {
        ...makeExternalPost({
          id: '44444444-4444-4444-4444-444444444444',
          publishedAt: new Date('2026-03-01T12:00:00Z'),
          createdAt: new Date('2026-02-01T00:00:00Z'),
          updatedAt: new Date('2026-02-02T00:00:00Z'),
        }),
        content: 'private body',
        slug: 'private-slug',
        status: 'draft',
        deletedAt: new Date('2026-04-01T00:00:00Z'),
      };
      repository.findAllForUser.mockResolvedValue([post]);

      // when: 공개 외부 글 목록 조회
      const result = await service.findAll();

      // then: 응답 필드와 날짜 표현이 공개 계약에 맞춰진다
      expect(Object.keys(result[0])).toEqual([
        'id',
        'title',
        'url',
        'source',
        'category',
        'publishedAt',
        'createdAt',
        'updatedAt',
      ]);
      expect(result[0]).toEqual({
        id: post.id,
        title: post.title,
        url: post.url,
        source: post.source,
        category: post.category,
        publishedAt: '2026-03-01T12:00:00.000Z',
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-02T00:00:00.000Z',
      });
      expect(result[0]).not.toHaveProperty('content');
      expect(result[0]).not.toHaveProperty('slug');
      expect(result[0]).not.toHaveProperty('status');
      expect(result[0]).not.toHaveProperty('deletedAt');
    });

    it('발행 시각과 분류가 없으면 null 그대로 응답한다', async () => {
      // given: 발행 시각과 분류가 비어 있는 외부 글
      const post = makeExternalPost({ category: null, publishedAt: null });
      repository.findAllForUser.mockResolvedValue([post]);

      // when: 공개 외부 글 목록 조회
      const result = await service.findAll();

      // then: nullable 필드가 임의 값으로 대체되지 않는다
      expect(result[0].publishedAt).toBeNull();
      expect(result[0].category).toBeNull();
    });
  });
});
