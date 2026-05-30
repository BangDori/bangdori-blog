import { Controller, Get, Param } from '@nestjs/common';
import { UserPostDetailDto } from '@/user/posts/dto/user-post-detail.dto';
import { UserPostListItemDto } from '@/user/posts/dto/user-post-list-item.dto';
import { UserPostsService } from '@/user/posts/user-posts.service';

@Controller('user/posts')
export class UserPostsController {
  constructor(private readonly userPostsService: UserPostsService) {}

  @Get()
  findAll(): Promise<UserPostListItemDto[]> {
    return this.userPostsService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<UserPostDetailDto> {
    return this.userPostsService.findBySlug(slug);
  }
}
