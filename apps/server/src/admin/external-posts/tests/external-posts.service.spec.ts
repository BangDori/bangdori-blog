import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ExternalPostsError } from '@admin/external-posts/external-posts.error';
import { ExternalPostsRepository } from '@admin/external-posts/external-posts.repository';
import { ExternalPostsService } from '@admin/external-posts/external-posts.service';
import { ExternalPost } from '@database/entities/external-post.entity';

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
    it('필수 필드로 저장하면 publishedAt은 null로 채워진다', async () => {
      const draft = makeExternalPost({ publishedAt: null });
      repository.create.mockReturnValue(draft);
      repository.save.mockResolvedValue(draft);

      const result = await service.create({
        title: draft.title,
        url: draft.url,
        source: draft.source,
        category: draft.category ?? 'tech',
      });

      expect(repository.create).toHaveBeenCalledWith({
        title: draft.title,
        url: draft.url,
        source: draft.source,
        category: draft.category,
        publishedAt: null,
      });
      expect(repository.save).toHaveBeenCalledWith(draft);
      expect(result).toBe(draft);
    });

    it('publishedAt이 주어지면 Date로 변환해 저장한다', async () => {
      const isoString = '2026-04-01T00:00:00Z';
      const draft = makeExternalPost({ publishedAt: new Date(isoString) });
      repository.create.mockReturnValue(draft);
      repository.save.mockResolvedValue(draft);

      await service.create({
        title: draft.title,
        url: draft.url,
        source: draft.source,
        category: draft.category ?? 'tech',
        publishedAt: isoString,
      });

      const createArg = repository.create.mock.calls[0]?.[0];
      expect(createArg?.publishedAt).toEqual(new Date(isoString));
    });

    it('url 중복(PG 23505)이면 ConflictException으로 변환된다', async () => {
      const draft = makeExternalPost();
      repository.create.mockReturnValue(draft);
      repository.save.mockRejectedValue(makePgUniqueError());

      await expect(
        service.create({
          title: draft.title,
          url: draft.url,
          source: draft.source,
          category: draft.category ?? 'tech',
        }),
      ).rejects.toThrow(
        new ConflictException(ExternalPostsError.externalPostUrlConflict(draft.url)),
      );
    });
  });

  describe('update', () => {
    it('빈 payload면 BadRequestException', async () => {
      await expect(service.update('id', {})).rejects.toThrow(
        new BadRequestException(ExternalPostsError.updateFieldRequired),
      );
    });

    it('대상이 없으면 NotFoundException', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('missing', { title: 'new' })).rejects.toThrow(
        new NotFoundException(ExternalPostsError.externalPostNotFound('missing')),
      );
    });

    it('title을 수정하면 save가 호출되고 새 값이 반영된다', async () => {
      const existing = makeExternalPost({ title: 'old' });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);

      const result = await service.update(existing.id, { title: 'new' });

      expect(result.title).toBe('new');
      expect(repository.save).toHaveBeenCalled();
    });

    it('category를 수정하면 새 값이 반영된다', async () => {
      const existing = makeExternalPost({ category: 'tech' });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);

      const result = await service.update(existing.id, { category: '회고' });

      expect(result.category).toBe('회고');
    });

    it('publishedAt(ISO 문자열)이 Date로 변환되어 반영된다', async () => {
      const existing = makeExternalPost({ publishedAt: null });
      repository.findById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (post) => post);
      const iso = '2026-04-10T00:00:00Z';

      const result = await service.update(existing.id, { publishedAt: iso });

      expect(result.publishedAt).toEqual(new Date(iso));
    });

    it('url 중복(PG 23505)이면 ConflictException으로 변환된다', async () => {
      const existing = makeExternalPost();
      repository.findById.mockResolvedValue(existing);
      repository.save.mockRejectedValue(makePgUniqueError());

      await expect(service.update(existing.id, { url: 'https://dup.com/x' })).rejects.toThrow(
        new ConflictException(ExternalPostsError.externalPostUrlConflict('https://dup.com/x')),
      );
    });
  });

  describe('delete', () => {
    it('대상 존재 시 hard delete 수행', async () => {
      const existing = makeExternalPost();
      repository.findById.mockResolvedValue(existing);
      repository.deleteById.mockResolvedValue(undefined);

      await service.delete(existing.id);

      expect(repository.deleteById).toHaveBeenCalledWith(existing.id);
    });

    it('대상이 없으면 NotFoundException', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('missing')).rejects.toThrow(
        new NotFoundException(ExternalPostsError.externalPostNotFound('missing')),
      );
      expect(repository.deleteById).not.toHaveBeenCalled();
    });
  });
});
