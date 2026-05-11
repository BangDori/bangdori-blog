import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../database/entities/post.entity';
import { AdminPostsController } from './admin-posts.controller';
import { AdminPostsRepository } from './admin-posts.repository';
import { AdminPostsService } from './admin-posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [AdminPostsController],
  providers: [AdminPostsRepository, AdminPostsService],
})
export class AdminPostsModule {}
