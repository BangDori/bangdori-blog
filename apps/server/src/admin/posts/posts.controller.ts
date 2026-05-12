import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('admin/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query() query: ListPostsQueryDto) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.publish(id);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.archive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.delete(id);
  }
}
