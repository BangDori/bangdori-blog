import { PostsController } from '@admin/posts/posts.controller';
import { PostsRepository } from '@admin/posts/posts.repository';
import { PostsService } from '@admin/posts/posts.service';
import { Post } from '@database/entities/post.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsRepository, PostsService],
})
export class AdminPostsModule {}
