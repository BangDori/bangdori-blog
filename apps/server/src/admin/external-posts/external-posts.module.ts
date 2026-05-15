import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalPostsController } from '@admin/external-posts/external-posts.controller';
import { ExternalPostsRepository } from '@admin/external-posts/external-posts.repository';
import { ExternalPostsService } from '@admin/external-posts/external-posts.service';
import { ExternalPost } from '@database/entities/external-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExternalPost])],
  controllers: [ExternalPostsController],
  providers: [ExternalPostsRepository, ExternalPostsService],
})
export class ExternalPostsModule {}
