import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalPost } from '@database/entities/external-post.entity';
import { UserExternalPostsController } from '@/user/external-posts/user-external-posts.controller';
import { UserExternalPostsRepository } from '@/user/external-posts/user-external-posts.repository';
import { UserExternalPostsService } from '@/user/external-posts/user-external-posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExternalPost])],
  controllers: [UserExternalPostsController],
  providers: [UserExternalPostsRepository, UserExternalPostsService],
})
export class UserExternalPostsModule {}
