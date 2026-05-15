import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ExternalPost } from '@database/entities/external-post.entity';

@Injectable()
export class ExternalPostsRepository {
  constructor(
    @InjectRepository(ExternalPost)
    private readonly repository: Repository<ExternalPost>,
  ) {}

  create(input: DeepPartial<ExternalPost>): ExternalPost {
    return this.repository.create(input);
  }

  async findAll(): Promise<ExternalPost[]> {
    return this.repository
      .createQueryBuilder('externalPost')
      .orderBy('externalPost.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('externalPost.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<ExternalPost | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(post: ExternalPost): Promise<ExternalPost> {
    return this.repository.save(post);
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
