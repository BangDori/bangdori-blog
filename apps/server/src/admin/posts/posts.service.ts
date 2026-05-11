import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostStatus } from '../../database/entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsError } from './posts.error';
import { PostsRepository } from './posts.repository';

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

    return this.postsRepository.save(post);
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    const entries = Object.entries(dto).filter(([, value]) => value !== undefined);

    if (entries.length === 0) {
      throw new BadRequestException(PostsError.updateFieldRequired);
    }

    const post = await this.findEntityById(id);
    const hasChanges = entries.some(([key, value]) => post[key as keyof UpdatePostDto] !== value);

    if (!hasChanges) {
      return post;
    }

    Object.assign(post, Object.fromEntries(entries));

    return this.postsRepository.save(post);
  }

  async publish(id: string): Promise<Post> {
    const post = await this.findEntityById(id);

    if (post.status === PostStatus.PUBLISHED) {
      return post;
    }

    post.status = PostStatus.PUBLISHED;
    post.publishedAt ??= new Date();

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
    const deleted = await this.postsRepository.softDeleteById(id);

    if (!deleted) {
      throw new NotFoundException(PostsError.postDeleteTargetNotFound(id));
    }
  }

  private async findEntityById(id: string): Promise<Post> {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new NotFoundException(PostsError.postNotFound(id));
    }

    return post;
  }
}
