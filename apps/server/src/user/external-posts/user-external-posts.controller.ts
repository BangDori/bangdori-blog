import { Controller, Get } from '@nestjs/common';
import { UserExternalPostListItemDto } from '@/user/external-posts/dto/user-external-post-list-item.dto';
import { UserExternalPostsService } from '@/user/external-posts/user-external-posts.service';

@Controller('user/external-posts')
export class UserExternalPostsController {
  constructor(private readonly userExternalPostsService: UserExternalPostsService) {}

  @Get()
  findAll(): Promise<UserExternalPostListItemDto[]> {
    return this.userExternalPostsService.findAll();
  }
}
