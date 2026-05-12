import { PostStatus } from '@database/entities/post.entity';
import { IsEnum, IsOptional } from 'class-validator';

export class ListPostsQueryDto {
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
