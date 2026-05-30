import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Post, PostStatus } from '@database/entities/post.entity';

@Injectable()
export class UserPostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly repository: Repository<Post>,
  ) {}

  async findPublishedList(): Promise<Post[]> {
    return this.repository
      .createQueryBuilder('post')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async findPublishedBySlug(slug: string): Promise<Post | null> {
    return this.repository.findOne({
      where: { slug, status: PostStatus.PUBLISHED, deletedAt: IsNull() },
    });
  }
}
