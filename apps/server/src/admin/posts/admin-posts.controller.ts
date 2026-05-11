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
import { AdminPostsService } from './admin-posts.service';
import { CreateAdminPostDto } from './dto/create-admin-post.dto';
import { ListAdminPostsQueryDto } from './dto/list-admin-posts-query.dto';
import { UpdateAdminPostDto } from './dto/update-admin-post.dto';

@Controller('admin/posts')
export class AdminPostsController {
  constructor(private readonly adminPostsService: AdminPostsService) {}

  @Get()
  findAll(@Query() query: ListAdminPostsQueryDto) {
    return this.adminPostsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminPostsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAdminPostDto) {
    return this.adminPostsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminPostDto) {
    return this.adminPostsService.update(id, dto);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminPostsService.publish(id);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminPostsService.archive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminPostsService.delete(id);
  }
}
