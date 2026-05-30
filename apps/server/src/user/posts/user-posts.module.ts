import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '@database/entities/post.entity';
import { UserPostsController } from '@/user/posts/user-posts.controller';
import { UserPostsRepository } from '@/user/posts/user-posts.repository';
import { UserPostsService } from '@/user/posts/user-posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [UserPostsController],
  providers: [UserPostsRepository, UserPostsService],
})
export class UserPostsModule {}
