import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPostDetailDto } from '@/user/posts/dto/user-post-detail.dto';
import { UserPostListItemDto } from '@/user/posts/dto/user-post-list-item.dto';
import { UserPostsError } from '@/user/posts/user-posts.error';
import { UserPostsRepository } from '@/user/posts/user-posts.repository';

@Injectable()
export class UserPostsService {
  constructor(private readonly userPostsRepository: UserPostsRepository) {}

  async findAll(): Promise<UserPostListItemDto[]> {
    const posts = await this.userPostsRepository.findPublishedList();

    return posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
      thumbnailUrl: post.thumbnailUrl,
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      updatedAt: post.updatedAt.toISOString(),
    }));
  }

  async findBySlug(slug: string): Promise<UserPostDetailDto> {
    const post = await this.userPostsRepository.findPublishedBySlug(slug);

    if (!post) {
      throw new NotFoundException(UserPostsError.userPostNotFound(slug));
    }

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      contentMdx: post.contentMdx,
      author: post.author,
      category: post.category,
      thumbnailUrl: post.thumbnailUrl,
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }
}
