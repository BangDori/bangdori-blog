import { Test } from '@nestjs/testing';
import { ExternalPost } from '@database/entities/external-post.entity';
import { UserExternalPostsError } from '@/user/external-posts/user-external-posts.error';
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
    publishedAt: new Date('2026-03-01T12:00:00Z'),
    createdAt: new Date('2026-02-01T00:00:00Z'),
    updatedAt: new Date('2026-02-02T00:00:00Z'),
    ...overrides,
  };
}

describe('UserExternalPostsError', () => {
  it('외부 글 목록을 불러오지 못하면 안내 메시지를 제공한다', () => {
    // given: 외부 글 목록 조회 실패 상황

    // when: 공개 외부 글 도메인의 실패 메시지를 확인
    const message = UserExternalPostsError.externalPostsFetchFailed;

    // then: 사용자가 이해할 수 있는 안내 메시지를 제공한다
    expect(message).toBe('외부 글 목록을 불러오지 못했습니다.');
  });
});

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

      // then: 빈 배열을 그대로 응답
      expect(result).toEqual([]);
    });

    it('외부 글을 공개 목록 형태로 변환해 응답한다', async () => {
      // given: 날짜 메타데이터가 채워진 외부 글 한 건
      const post = makeExternalPost({
        id: '22222222-2222-2222-2222-222222222222',
        title: 'Published Elsewhere',
        url: 'https://example.com/published-elsewhere',
        source: 'medium',
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
          category: null,
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

    it('원본 값과 무관하게 category를 null로 응답한다', async () => {
      // given: 저장소 결과에 공개 계약에 없는 분류 값이 섞인 상태
      const post = { ...makeExternalPost(), category: 'dev' } as ExternalPost;
      repository.findAllForUser.mockResolvedValue([post]);

      // when: 공개 외부 글 목록 조회
      const result = await service.findAll();

      // then: 외부 글 분류는 항상 null이다
      expect(result[0]?.category).toBeNull();
    });

    it('저장소가 돌려준 순서를 보존한다', async () => {
      // given: 저장소가 이미 정렬한 외부 글 목록
      const first = makeExternalPost({ id: '11111111-1111-1111-1111-111111111111' });
      const second = makeExternalPost({ id: '22222222-2222-2222-2222-222222222222' });
      const third = makeExternalPost({ id: '33333333-3333-3333-3333-333333333333' });
      repository.findAllForUser.mockResolvedValue([first, second, third]);

      // when: 공개 외부 글 목록 조회
      const result = await service.findAll();

      // then: 응답 순서가 저장소 결과와 같다
      expect(result.map((item) => item.id)).toEqual([first.id, second.id, third.id]);
    });
  });
});
