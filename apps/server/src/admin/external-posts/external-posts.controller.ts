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
  UseGuards,
} from '@nestjs/common';
import { JwtAccessGuard } from '@admin/auth/jwt-access.guard';
import { CreateExternalPostDto } from '@admin/external-posts/dto/create-external-post.dto';
import { UpdateExternalPostDto } from '@admin/external-posts/dto/update-external-post.dto';
import { ExternalPostsService } from '@admin/external-posts/external-posts.service';

@UseGuards(JwtAccessGuard)
@Controller('admin/external-posts')
export class ExternalPostsController {
  constructor(private readonly externalPostsService: ExternalPostsService) {}

  @Get()
  findAll() {
    return this.externalPostsService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.externalPostsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateExternalPostDto) {
    return this.externalPostsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateExternalPostDto) {
    return this.externalPostsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.externalPostsService.delete(id);
  }
}
