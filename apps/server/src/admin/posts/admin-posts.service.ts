import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostStatus } from '../../database/entities/post.entity';
import { AdminPostsRepository } from './admin-posts.repository';
import { CreateAdminPostDto } from './dto/create-admin-post.dto';
import { ListAdminPostsQueryDto } from './dto/list-admin-posts-query.dto';
import { UpdateAdminPostDto } from './dto/update-admin-post.dto';

@Injectable()
export class AdminPostsService {
  constructor(private readonly adminPostsRepository: AdminPostsRepository) {}

  async findAll(query: ListAdminPostsQueryDto): Promise<Post[]> {
    return this.adminPostsRepository.findAll(query.status);
  }

  async findOne(id: string): Promise<Post> {
    return this.findEntityById(id);
  }

  async create(dto: CreateAdminPostDto): Promise<Post> {
    const post = this.adminPostsRepository.create({
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

    return this.adminPostsRepository.save(post);
  }

  async update(id: string, dto: UpdateAdminPostDto): Promise<Post> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field is required to update a post.');
    }

    const post = await this.findEntityById(id);
    const hasChanges = Object.entries(dto).some(
      ([key, value]) => post[key as keyof UpdateAdminPostDto] !== value,
    );

    if (!hasChanges) {
      return post;
    }

    Object.assign(post, dto);

    return this.adminPostsRepository.save(post);
  }

  async publish(id: string): Promise<Post> {
    const post = await this.findEntityById(id);

    if (post.status === PostStatus.PUBLISHED) {
      return post;
    }

    post.status = PostStatus.PUBLISHED;
    post.publishedAt ??= new Date();

    return this.adminPostsRepository.save(post);
  }

  async archive(id: string): Promise<Post> {
    const post = await this.findEntityById(id);

    if (post.status === PostStatus.ARCHIVED) {
      return post;
    }

    post.status = PostStatus.ARCHIVED;

    return this.adminPostsRepository.save(post);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.adminPostsRepository.softDeleteById(id);

    if (!deleted) {
      throw new NotFoundException(`Post not found: ${id}`);
    }
  }

  private async findEntityById(id: string): Promise<Post> {
    const post = await this.adminPostsRepository.findById(id);

    if (!post) {
      throw new NotFoundException(`Post not found: ${id}`);
    }

    return post;
  }
}
