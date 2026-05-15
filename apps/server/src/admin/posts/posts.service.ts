import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from '@admin/posts/dto/create-post.dto';
import { ListPostsQueryDto } from '@admin/posts/dto/list-posts-query.dto';
import { UpdatePostDto } from '@admin/posts/dto/update-post.dto';
import { PostsError } from '@admin/posts/posts.error';
import { PostsRepository } from '@admin/posts/posts.repository';
import { Post, PostStatus } from '@database/entities/post.entity';

const PG_UNIQUE_VIOLATION = '23505';

function isPgUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: string }).code === PG_UNIQUE_VIOLATION
  );
}

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async findAll(query: ListPostsQueryDto): Promise<Post[]> {
    return this.postsRepository.findAll(query.status);
  }

  async findOne(id: string): Promise<Post> {
    return this.findEntityById(id);
  }

  async create(dto: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create({
      slug: dto.slug,
      title: dto.title,
      description: dto.description ?? null,
      contentMdx: dto.contentMdx,
      status: PostStatus.DRAFT,
      author: dto.author,
      category: dto.category,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    });

    try {
      return await this.postsRepository.save(post);
    } catch (err) {
      if (isPgUniqueViolation(err)) {
        throw new ConflictException(PostsError.postSlugConflict(dto.slug));
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    if (!Object.values(dto).some((value) => value !== undefined)) {
      throw new BadRequestException(PostsError.updateFieldRequired);
    }

    const post = await this.findEntityById(id);

    if (dto.slug !== undefined) post.slug = dto.slug;
    if (dto.title !== undefined) post.title = dto.title;
    if (dto.description !== undefined) post.description = dto.description;
    if (dto.contentMdx !== undefined) post.contentMdx = dto.contentMdx;
    if (dto.author !== undefined) post.author = dto.author;
    if (dto.category !== undefined) post.category = dto.category;
    if (dto.thumbnailUrl !== undefined) post.thumbnailUrl = dto.thumbnailUrl;

    try {
      return await this.postsRepository.save(post);
    } catch (err) {
      if (isPgUniqueViolation(err)) {
        throw new ConflictException(PostsError.postSlugConflict(dto.slug ?? post.slug));
      }
      throw err;
    }
  }

  async publish(id: string): Promise<Post> {
    const post = await this.findEntityById(id);

    if (post.status === PostStatus.PUBLISHED) {
      return post;
    }

    post.status = PostStatus.PUBLISHED;
    post.publishedAt = new Date();

    return this.postsRepository.save(post);
  }

  async archive(id: string): Promise<Post> {
    const post = await this.findEntityById(id);

    if (post.status === PostStatus.ARCHIVED) {
      return post;
    }

    post.status = PostStatus.ARCHIVED;

    return this.postsRepository.save(post);
  }

  async delete(id: string): Promise<void> {
    const post = await this.findEntityById(id);

    await this.postsRepository.softDeleteById(post.id);
  }

  private async findEntityById(id: string): Promise<Post> {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new NotFoundException(PostsError.postNotFound(id));
    }

    return post;
  }
}
