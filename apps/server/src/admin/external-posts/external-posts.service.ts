import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExternalPostDto } from '@admin/external-posts/dto/create-external-post.dto';
import { UpdateExternalPostDto } from '@admin/external-posts/dto/update-external-post.dto';
import { ExternalPostsError } from '@admin/external-posts/external-posts.error';
import { ExternalPostsRepository } from '@admin/external-posts/external-posts.repository';
import { ExternalPost } from '@database/entities/external-post.entity';

const PG_UNIQUE_VIOLATION = '23505';

function isPgUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: string }).code === PG_UNIQUE_VIOLATION
  );
}

@Injectable()
export class ExternalPostsService {
  constructor(private readonly externalPostsRepository: ExternalPostsRepository) {}

  async findAll(): Promise<ExternalPost[]> {
    return this.externalPostsRepository.findAll();
  }

  async findById(id: string): Promise<ExternalPost> {
    return this.findEntityById(id);
  }

  async create(dto: CreateExternalPostDto): Promise<ExternalPost> {
    const post = this.externalPostsRepository.create({
      title: dto.title,
      url: dto.url,
      source: dto.source,
      category: dto.category,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    });

    try {
      return await this.externalPostsRepository.save(post);
    } catch (err) {
      if (isPgUniqueViolation(err)) {
        throw new ConflictException(ExternalPostsError.externalPostUrlConflict(dto.url));
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateExternalPostDto): Promise<ExternalPost> {
    if (!Object.values(dto).some((value) => value !== undefined)) {
      throw new BadRequestException(ExternalPostsError.updateFieldRequired);
    }

    const post = await this.findEntityById(id);

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.url !== undefined) post.url = dto.url;
    if (dto.source !== undefined) post.source = dto.source;
    if (dto.category !== undefined) post.category = dto.category;
    if (dto.publishedAt !== undefined) {
      post.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }

    try {
      return await this.externalPostsRepository.save(post);
    } catch (err) {
      if (isPgUniqueViolation(err)) {
        throw new ConflictException(
          ExternalPostsError.externalPostUrlConflict(dto.url ?? post.url),
        );
      }
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    await this.findEntityById(id);
    await this.externalPostsRepository.deleteById(id);
  }

  private async findEntityById(id: string): Promise<ExternalPost> {
    const post = await this.externalPostsRepository.findById(id);

    if (!post) {
      throw new NotFoundException(ExternalPostsError.externalPostNotFound(id));
    }

    return post;
  }
}
