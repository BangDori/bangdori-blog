import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Post, PostStatus } from '@database/entities/post.entity';
import { UserPostsError } from '@/user/posts/user-posts.error';
import { UserPostsRepository } from '@/user/posts/user-posts.repository';
import { UserPostsService } from '@/user/posts/user-posts.service';

type UserPostsRepositoryMock = {
  [K in keyof UserPostsRepository]: jest.Mock;
};

function createRepositoryMock(): UserPostsRepositoryMock {
  return {
    findPublishedList: jest.fn(),
    findPublishedBySlug: jest.fn(),
  };
}

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'hello',
    title: 'Hello',
    description: null,
    contentMdx: '# hi',
    status: PostStatus.PUBLISHED,
    author: 'bangdori',
    category: 'dev',
    thumbnailUrl: null,
    viewCount: '0',
    publishedAt: new Date('2026-03-01T12:00:00Z'),
    deletedAt: null,
    createdAt: new Date('2026-02-01T00:00:00Z'),
    updatedAt: new Date('2026-02-02T00:00:00Z'),
    ...overrides,
  };
}

describe('UserPostsService', () => {
  let service: UserPostsService;
  let repository: UserPostsRepositoryMock;

  beforeEach(async () => {
    repository = createRepositoryMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserPostsService,
        {
          provide: UserPostsRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = moduleRef.get(UserPostsService);
  });

  describe('findBySlug', () => {
    it('공개 대상 글이 없으면 찾을 수 없다고 알린다', async () => {
      // given: 저장소가 해당 slug 의 공개 글을 찾지 못한 상태
      repository.findPublishedBySlug.mockResolvedValue(null);

      // when & then: 정해진 안내 메시지와 함께 조회가 거부된다
      await expect(service.findBySlug('ghost')).rejects.toThrow(
        new NotFoundException(UserPostsError.userPostNotFound('ghost')),
      );
    });

    it('공개 글을 slug 로 조회하면 공개 상세 형태로 변환해 응답한다', async () => {
      // given: 발행된 글 한 건 (운영 메타가 채워져 있음)
      const post = makePost({
        slug: 'published-one',
        viewCount: '42',
        publishedAt: new Date('2026-03-01T12:00:00Z'),
        createdAt: new Date('2026-02-01T00:00:00Z'),
        updatedAt: new Date('2026-02-02T00:00:00Z'),
      });
      repository.findPublishedBySlug.mockResolvedValue(post);

      // when: slug 로 상세 조회
      const result = await service.findBySlug('published-one');

      // then: 공개 필드만 노출되고 시간은 ISO8601 문자열로 직렬화된다
      expect(result).toEqual({
        id: post.id,
        slug: 'published-one',
        title: post.title,
        description: post.description,
        contentMdx: post.contentMdx,
        author: post.author,
        category: post.category,
        thumbnailUrl: post.thumbnailUrl,
        publishedAt: '2026-03-01T12:00:00.000Z',
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-02T00:00:00.000Z',
      });
    });
  });

  describe('findAll', () => {
    it('공개 글이 없으면 빈 목록을 응답한다', async () => {
      // given: 저장소가 빈 목록을 돌려준 상태
      repository.findPublishedList.mockResolvedValue([]);

      // when: 목록 조회
      const result = await service.findAll();

      // then: 빈 배열을 그대로 응답
      expect(result).toEqual([]);
    });

    it('저장소가 돌려준 순서 그대로 공개 목록 형태로 변환해 전달한다', async () => {
      // given: 저장소가 특정 순서로 정렬한 글 목록을 돌려준 상태
      const first = makePost({ slug: 'a', publishedAt: new Date('2026-03-01T00:00:00Z') });
      const second = makePost({ slug: 'b', publishedAt: new Date('2026-02-01T00:00:00Z') });
      const third = makePost({ slug: 'c', publishedAt: new Date('2026-01-01T00:00:00Z') });
      repository.findPublishedList.mockResolvedValue([first, second, third]);

      // when: 목록 조회
      const result = await service.findAll();

      // then: 순서가 보존되고 항목은 공개 목록 필드만 가진다
      expect(result.map((item) => item.slug)).toEqual(['a', 'b', 'c']);
      expect(result[0]).toEqual({
        id: first.id,
        slug: 'a',
        title: first.title,
        description: first.description,
        category: first.category,
        thumbnailUrl: first.thumbnailUrl,
        publishedAt: '2026-03-01T00:00:00.000Z',
      });
    });
  });
});
