import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalPost, ExternalPostStatus } from '@database/entities/external-post.entity';

@Injectable()
export class UserExternalPostsRepository {
  constructor(
    @InjectRepository(ExternalPost)
    private readonly repository: Repository<ExternalPost>,
  ) {}

  async findAllForUser(): Promise<ExternalPost[]> {
    return this.repository
      .createQueryBuilder('externalPost')
      .where('externalPost.status = :status', { status: ExternalPostStatus.PUBLISHED })
      .orderBy('externalPost.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('externalPost.createdAt', 'DESC')
      .getMany();
  }
}
