import { IsEnum, IsOptional } from 'class-validator';
import { PostStatus } from '../../../database/entities/post.entity';

export class ListAdminPostsQueryDto {
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
