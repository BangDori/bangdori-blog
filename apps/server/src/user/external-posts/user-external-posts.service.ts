import { Injectable } from '@nestjs/common';
import { UserExternalPostListItemDto } from '@/user/external-posts/dto/user-external-post-list-item.dto';
import { UserExternalPostsRepository } from '@/user/external-posts/user-external-posts.repository';

@Injectable()
export class UserExternalPostsService {
  constructor(private readonly userExternalPostsRepository: UserExternalPostsRepository) {}

  async findAll(): Promise<UserExternalPostListItemDto[]> {
    const posts = await this.userExternalPostsRepository.findAllForUser();

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      url: post.url,
      source: post.source,
      category: null,
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));
  }
}
