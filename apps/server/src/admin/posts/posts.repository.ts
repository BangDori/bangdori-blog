import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { Post, PostStatus } from '@database/entities/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly repository: Repository<Post>,
  ) {}

  create(input: DeepPartial<Post>): Post {
    return this.repository.create(input);
  }

  async findAll(status?: PostStatus): Promise<Post[]> {
    const queryBuilder = this.repository.createQueryBuilder('post');

    queryBuilder.where('post.deletedAt IS NULL');

    if (status) {
      queryBuilder.andWhere('post.status = :status', { status });
    }

    return queryBuilder
      .orderBy('post.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<Post | null> {
    return this.repository.findOne({ where: { id, deletedAt: IsNull() } });
  }

  async softDeleteById(id: string): Promise<void> {
    await this.repository.query(
      'UPDATE "posts" SET "deleted_at" = now() WHERE "id" = $1 AND "deleted_at" IS NULL',
      [id],
    );
  }

  async save(post: Post): Promise<Post> {
    return this.repository.save(post);
  }
}
