import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PostsError } from '@admin/posts/posts.error';
import { PostsRepository } from '@admin/posts/posts.repository';
import { PostsService } from '@admin/posts/posts.service';
import { Post, PostStatus } from '@database/entities/post.entity';

type PostsRepositoryMock = {
  [K in keyof PostsRepository]: jest.Mock;
};

function createPostsRepositoryMock(): PostsRepositoryMock {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    softDeleteById: jest.fn(),
    save: jest.fn(),
  };
}

function makePgUniqueError(): Error & { code: string } {
  const err = new Error('duplicate key value violates unique constraint') as Error & {
    code: string;
  };
  err.code = '23505';
  return err;
}

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'hello',
    title: 'Hello',
    description: null,
    contentMdx: '# hi',
    status: PostStatus.DRAFT,
    author: 'bangdori',
    category: 'dev',
    thumbnailUrl: null,
    viewCount: '0',
    publishedAt: null,
    deletedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('PostsService', () => {
  let service: PostsService;
  let repository: PostsRepositoryMock;

  beforeEach(async () => {
    // ① 새 mock repository 객체 만들기
    repository = createPostsRepositoryMock();

    // ② NestJS DI 컨테이너의 "축소판"을 만들고 service + mock을 등록
    const moduleRef = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PostsRepository,
          useValue: repository, // ← 진짜 PostsRepository 대신 우리 mock 주입
        },
      ],
    }).compile();

    // ③ 컨테이너에서 PostsService 인스턴스 꺼내기 (생성자에 mock이 자동 주입된 상태)
    service = moduleRef.get(PostsService);
  });

  describe('create', () => {
    it('slug 중복(PG 23505)이면 ConflictException 으로 변환된다', async () => {
      // given: repository.save 가 PG unique violation 을 던진다
      repository.create.mockImplementation((input) => input as Post);
      repository.save.mockRejectedValue(makePgUniqueError());

      // when & then: 23505 는 ConflictException 으로 변환되고 메시지에 slug 가 포함된다
      await expect(
        service.create({
          slug: 'dup-slug',
          title: 't',
          contentMdx: 'c',
          author: 'a',
          category: 'cat',
        }),
      ).rejects.toThrow(new ConflictException(PostsError.postSlugConflict('dup-slug')));
    });

    it('23505 가 아닌 다른 에러는 그대로 위로 던진다', async () => {
      // given: repository.save 가 일반 Error 를 던진다
      const other = new Error('boom');
      repository.create.mockImplementation((input) => input as Post);
      repository.save.mockRejectedValue(other);

      // when & then: 변환되지 않고 원본 그대로 전파
      await expect(
        service.create({
          slug: 's',
          title: 't',
          contentMdx: 'c',
          author: 'a',
          category: 'cat',
        }),
      ).rejects.toBe(other);
    });
  });

  describe('update', () => {
    it('빈 payload면 BadRequestException', async () => {
      // given: 별도 셋업 없음 — 빈 payload는 findById 도달 전에 막혀야 함

      // when & then: 빈 payload로 update 호출 시 BadRequest + 정해진 메시지
      await expect(service.update('id', {})).rejects.toThrow(
        new BadRequestException(PostsError.updateFieldRequired),
      );
    });

    it('실제 변경이 없는 값이면 save 호출 없이 기존 entity 반환 (idempotent)', async () => {
      // given: 기존 글의 title === 'same'
      const existing = makePost({ title: 'same' });
      repository.findById.mockResolvedValue(existing);

      // when: 동일한 값으로 update 호출
      const result = await service.update(existing.id, { title: 'same' });

      // then: 변경 사항이 없으므로 save 호출 없이 기존 인스턴스를 그대로 반환
      expect(result).toBe(existing);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('slug 중복(PG 23505)이면 ConflictException 으로 변환된다', async () => {
      // given: 기존 글 + repository.save 가 PG unique violation 을 던진다
      const existing = makePost({ slug: 'old' });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockRejectedValue(makePgUniqueError());

      // when & then: 23505 는 ConflictException 으로 변환되고 메시지에 새 slug 가 포함된다
      await expect(service.update(existing.id, { slug: 'taken' })).rejects.toThrow(
        new ConflictException(PostsError.postSlugConflict('taken')),
      );
    });

    it('slug 없이 다른 필드 수정 중 충돌이 나면 기존 slug 로 메시지 구성', async () => {
      // given: 기존 글의 slug=old 이고 dto 에는 slug 가 없으니 기존 값을 그대로 쓰게 된다
      const existing = makePost({ slug: 'old' });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockRejectedValue(makePgUniqueError());

      // when & then: title 만 바꿈 시도이지만 23505 나면 ConflictException 으로 변환, 메시지는 existing.slug
      await expect(service.update(existing.id, { title: 'new' })).rejects.toThrow(
        new ConflictException(PostsError.postSlugConflict('old')),
      );
    });

    it('23505 가 아닌 다른 에러는 그대로 위로 던진다', async () => {
      // given: 기존 글 + repository.save 가 일반 Error 를 던진다
      const existing = makePost({ slug: 'old' });
      const other = new Error('boom');
      repository.findById.mockResolvedValue(existing);
      repository.save.mockRejectedValue(other);

      // when & then: 변환되지 않고 원본 그대로 전파
      await expect(service.update(existing.id, { title: 'new' })).rejects.toBe(other);
    });

    it('변경 필드만 반영하고 나머지는 유지', async () => {
      // given: 기존 글 (title=old, description=old desc)
      const existing = makePost({ title: 'old', description: 'old desc' });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);

      // when: title만 새 값으로 update
      const result = await service.update(existing.id, { title: 'new' });

      // then: title만 새 값, 나머지 필드는 existing 그대로
      expect(result).toEqual({ ...existing, title: 'new' });
    });
  });

  describe('publish', () => {
    it('draft → published 로 변경하고 publishedAt 없으면 현재 시각으로 설정', async () => {
      // given: status=draft, publishedAt=null 인 글
      const existing = makePost({ status: PostStatus.DRAFT, publishedAt: null });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);
      const before = Date.now();

      // when: publish 호출
      const result = await service.publish(existing.id);

      // then: status는 PUBLISHED, publishedAt은 호출 시각 이후
      expect(result.status).toBe(PostStatus.PUBLISHED);
      expect(result.publishedAt?.getTime()).toBeGreaterThanOrEqual(before);
    });

    it('publishedAt이 이미 있어도 현재 시각으로 갱신한다', async () => {
      // given: status=draft 이지만 publishedAt에 과거 시각이 미리 박혀있는 글
      const oldDate = new Date('2025-01-01T00:00:00Z');
      const existing = makePost({ status: PostStatus.DRAFT, publishedAt: oldDate });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);
      const before = Date.now();

      // when: publish 호출
      const result = await service.publish(existing.id);

      // then: 이전 publishedAt(oldDate)은 덮어쓰고 호출 시각으로 갱신
      expect(result.status).toBe(PostStatus.PUBLISHED);
      expect(result.publishedAt?.getTime()).toBeGreaterThanOrEqual(before);
    });

    it('이미 published면 idempotent하게 그대로 반환', async () => {
      // given: 이미 published 상태인 글
      const fixed = new Date('2025-01-01T00:00:00Z');
      const existing = makePost({ status: PostStatus.PUBLISHED, publishedAt: fixed });
      repository.findById.mockResolvedValue(existing);

      // when: publish 호출
      const result = await service.publish(existing.id);

      // then: 가드 분기에서 early return → save 호출 없이 기존 인스턴스 그대로
      expect(result).toBe(existing);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('draft → archived', async () => {
      // given: status=draft 인 글
      const existing = makePost({ status: PostStatus.DRAFT });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);

      // when: archive 호출
      const result = await service.archive(existing.id);

      // then: status는 ARCHIVED 로 변경되고 save 가 호출됨
      expect(result.status).toBe(PostStatus.ARCHIVED);
      expect(repository.save).toHaveBeenCalled();
    });

    it('published → archived', async () => {
      // given: status=published 인 글
      const existing = makePost({
        status: PostStatus.PUBLISHED,
        publishedAt: new Date('2025-01-01T00:00:00Z'),
      });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);

      // when: archive 호출
      const result = await service.archive(existing.id);

      // then: status는 ARCHIVED 로 변경
      expect(result.status).toBe(PostStatus.ARCHIVED);
    });

    it('이미 archived면 idempotent', async () => {
      // given: 이미 archived 상태인 글
      const existing = makePost({ status: PostStatus.ARCHIVED });
      repository.findById.mockResolvedValue(existing);

      // when: archive 호출
      const result = await service.archive(existing.id);

      // then: 가드 분기에서 early return → save 호출 없이 기존 인스턴스 그대로
      expect(result).toBe(existing);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('대상 존재 시 soft delete 수행', async () => {
      // given: 존재하는 글
      const existing = makePost();
      repository.findById.mockResolvedValue(existing);
      repository.softDeleteById.mockResolvedValue(undefined);

      // when: delete 호출
      await service.delete(existing.id);

      // then: softDeleteById 가 해당 id 로 호출됨
      expect(repository.softDeleteById).toHaveBeenCalledWith(existing.id);
    });

    it('대상이 없으면 NotFoundException', async () => {
      // given: findById 가 null 반환 (대상 없음)
      repository.findById.mockResolvedValue(null);

      // when & then: delete 호출 시 NotFound + 정해진 메시지, softDeleteById 는 호출되지 않음
      await expect(service.delete('missing')).rejects.toThrow(
        new NotFoundException(PostsError.postNotFound('missing')),
      );
      expect(repository.softDeleteById).not.toHaveBeenCalled();
    });
  });
});
