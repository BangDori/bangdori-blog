import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ExternalPostsError } from '@admin/external-posts/external-posts.error';
import { ExternalPostsRepository } from '@admin/external-posts/external-posts.repository';
import { ExternalPostsService } from '@admin/external-posts/external-posts.service';
import { ExternalPost, ExternalPostStatus } from '@database/entities/external-post.entity';

type ExternalPostsRepositoryMock = {
  [K in keyof ExternalPostsRepository]: jest.Mock;
};

function createRepositoryMock(): ExternalPostsRepositoryMock {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    deleteById: jest.fn(),
  };
}

function makeExternalPost(overrides: Partial<ExternalPost> = {}): ExternalPost {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'External Title',
    url: 'https://medium.com/@bangdori/post',
    source: 'medium',
    category: 'tech',
    status: ExternalPostStatus.DRAFT,
    publishedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function makePgUniqueError(): Error {
  const err = new Error('duplicate key value violates unique constraint') as Error & {
    code: string;
  };
  err.code = '23505';
  return err;
}

describe('ExternalPostsService', () => {
  let service: ExternalPostsService;
  let repository: ExternalPostsRepositoryMock;

  beforeEach(async () => {
    repository = createRepositoryMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ExternalPostsService,
        {
          provide: ExternalPostsRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = moduleRef.get(ExternalPostsService);
  });

  describe('create', () => {
    it('필수 필드로 저장하면 초안 상태와 빈 발행 시각으로 저장한다', async () => {
      // given: 발행 정보 없이 외부 글을 등록하려는 상태
      const draft = makeExternalPost({ publishedAt: null });
      repository.create.mockReturnValue(draft);
      repository.save.mockResolvedValue(draft);

      // when: 외부 글을 생성한다
      const result = await service.create({
        title: draft.title,
        url: draft.url,
        source: draft.source,
        category: draft.category,
      });

      // then: 공개 전 상태로 저장하고 생성 결과를 반환한다
      expect(repository.create).toHaveBeenCalledWith({
        title: draft.title,
        url: draft.url,
        source: draft.source,
        category: draft.category,
        status: ExternalPostStatus.DRAFT,
        publishedAt: null,
      });
      expect(repository.save).toHaveBeenCalledWith(draft);
      expect(result).toBe(draft);
    });

    it('발행 시각이 주어지면 날짜 값으로 바꿔 초안에 저장한다', async () => {
      // given: 외부 플랫폼의 발행 시각을 함께 기록하려는 상태
      const isoString = '2026-04-01T00:00:00Z';
      const draft = makeExternalPost({ publishedAt: new Date(isoString) });
      repository.create.mockReturnValue(draft);
      repository.save.mockResolvedValue(draft);

      // when: 외부 글을 생성한다
      await service.create({
        title: draft.title,
        url: draft.url,
        source: draft.source,
        category: draft.category,
        publishedAt: isoString,
      });

      // then: 상태는 공개 전으로 두고 발행 시각만 날짜 값으로 저장한다
      const createArg = repository.create.mock.calls[0]?.[0];
      expect(createArg?.status).toBe(ExternalPostStatus.DRAFT);
      expect(createArg?.publishedAt).toEqual(new Date(isoString));
    });

    it('url 이 중복되면 새 외부 글 생성을 거부한다', async () => {
      // given: 같은 URL의 외부 글이 이미 저장된 상태
      const draft = makeExternalPost();
      repository.create.mockReturnValue(draft);
      repository.save.mockRejectedValue(makePgUniqueError());

      // when & then: 외부 글 생성을 거부한다
      await expect(
        service.create({
          title: draft.title,
          url: draft.url,
          source: draft.source,
          category: draft.category,
        }),
      ).rejects.toThrow(
        new ConflictException(ExternalPostsError.externalPostUrlConflict(draft.url)),
      );
    });
  });

  describe('update', () => {
    it('수정할 값이 없으면 외부 글 수정을 거부한다', async () => {
      // given: 변경할 필드가 없는 상태

      // when & then: 외부 글 수정을 거부한다
      await expect(service.update('id', {})).rejects.toThrow(
        new BadRequestException(ExternalPostsError.updateFieldRequired),
      );
    });

    it('존재하지 않는 외부 글을 수정하려 하면 실패 메시지를 보낸다', async () => {
      // given: 수정 대상 외부 글이 없는 상태
      repository.findById.mockResolvedValue(null);

      // when & then: 정해진 실패 메시지가 발생한다
      await expect(service.update('missing', { title: 'new' })).rejects.toThrow(
        new NotFoundException(ExternalPostsError.externalPostNotFound('missing')),
      );
    });

    it('제목을 수정하면 새 제목으로 저장한다', async () => {
      // given: 제목을 바꿀 수 있는 외부 글이 있는 상태
      const existing = makeExternalPost({ title: 'old' });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);

      // when: 제목을 수정한다
      const result = await service.update(existing.id, { title: 'new' });

      // then: 새 제목이 반영되고 저장된다
      expect(result.title).toBe('new');
      expect(repository.save).toHaveBeenCalledWith(existing);
    });

    it('분류를 수정하면 새 분류로 저장한다', async () => {
      // given: 분류를 바꿀 수 있는 외부 글이 있는 상태
      const existing = makeExternalPost({ category: 'tech' });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);

      // when: 분류를 수정한다
      const result = await service.update(existing.id, { category: '회고' });

      // then: 새 분류가 반영된다
      expect(result.category).toBe('회고');
    });

    it('url 이 중복되면 외부 글 수정을 거부한다', async () => {
      // given: 수정하려는 URL이 다른 외부 글과 겹치는 상태
      const existing = makeExternalPost();
      repository.findById.mockResolvedValue(existing);
      repository.save.mockRejectedValue(makePgUniqueError());

      // when & then: 외부 글 수정을 거부한다
      await expect(service.update(existing.id, { url: 'https://dup.com/x' })).rejects.toThrow(
        new ConflictException(ExternalPostsError.externalPostUrlConflict('https://dup.com/x')),
      );
    });
  });

  describe('publish', () => {
    it('초안 외부 글을 발행하면 공개 상태와 발행 시각을 저장한다', async () => {
      // given: 아직 공개되지 않은 외부 글이 있는 상태
      const existing = makeExternalPost({ status: ExternalPostStatus.DRAFT, publishedAt: null });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);
      const before = Date.now();

      // when: 외부 글을 발행한다
      const result = await service.publish(existing.id);

      // then: 공개 상태로 바뀌고 발행 시각이 서버 시각으로 채워진다
      expect(result.status).toBe(ExternalPostStatus.PUBLISHED);
      expect(result.publishedAt?.getTime()).toBeGreaterThanOrEqual(before);
      expect(repository.save).toHaveBeenCalledWith(existing);
    });

    it('이미 발행된 외부 글을 발행하면 기존 값을 그대로 반환한다', async () => {
      // given: 이미 공개된 외부 글이 있는 상태
      const fixed = new Date('2026-04-01T00:00:00Z');
      const existing = makeExternalPost({
        status: ExternalPostStatus.PUBLISHED,
        publishedAt: fixed,
      });
      repository.findById.mockResolvedValue(existing);

      // when: 외부 글을 다시 발행한다
      const result = await service.publish(existing.id);

      // then: 저장 없이 기존 상태를 유지한다
      expect(result).toBe(existing);
      expect(result.publishedAt).toBe(fixed);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('발행된 외부 글을 보관하면 보관 상태로 저장한다', async () => {
      // given: 공개 중인 외부 글이 있는 상태
      const existing = makeExternalPost({
        status: ExternalPostStatus.PUBLISHED,
        publishedAt: new Date('2026-04-01T00:00:00Z'),
      });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);

      // when: 외부 글을 보관한다
      const result = await service.archive(existing.id);

      // then: 보관 상태로 바뀌고 저장된다
      expect(result.status).toBe(ExternalPostStatus.ARCHIVED);
      expect(repository.save).toHaveBeenCalledWith(existing);
    });

    it('이미 보관된 외부 글을 보관하면 기존 값을 그대로 반환한다', async () => {
      // given: 이미 보관된 외부 글이 있는 상태
      const existing = makeExternalPost({ status: ExternalPostStatus.ARCHIVED });
      repository.findById.mockResolvedValue(existing);

      // when: 외부 글을 다시 보관한다
      const result = await service.archive(existing.id);

      // then: 저장 없이 기존 상태를 유지한다
      expect(result).toBe(existing);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('외부 글을 삭제하면 저장소에서 제거한다', async () => {
      // given: 삭제할 수 있는 외부 글이 있는 상태
      const existing = makeExternalPost();
      repository.findById.mockResolvedValue(existing);
      repository.deleteById.mockResolvedValue(undefined);

      // when: 외부 글을 삭제한다
      await service.delete(existing.id);

      // then: 해당 외부 글이 저장소에서 제거된다
      expect(repository.deleteById).toHaveBeenCalledWith(existing.id);
    });

    it('존재하지 않는 외부 글을 삭제하려 하면 실패 메시지를 보낸다', async () => {
      // given: 삭제 대상 외부 글이 없는 상태
      repository.findById.mockResolvedValue(null);

      // when & then: 정해진 실패 메시지가 발생한다
      await expect(service.delete('missing')).rejects.toThrow(
        new NotFoundException(ExternalPostsError.externalPostNotFound('missing')),
      );
      expect(repository.deleteById).not.toHaveBeenCalled();
    });
  });
});
