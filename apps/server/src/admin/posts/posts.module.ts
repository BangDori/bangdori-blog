import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../database/entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsRepository, PostsService],
})
export class AdminPostsModule {}
