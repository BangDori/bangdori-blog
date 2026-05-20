import { api } from '@shared/lib/http';
import type { CreatePostDto, UpdatePostDto } from '../model/schema';
import type { ListPostsQueryDto, Post } from '../model/types';

export function listPosts(query: ListPostsQueryDto = {}): Promise<Post[]> {
  return api.get<Post[]>('/admin/posts', { status: query.status });
}

export function getPost(id: string): Promise<Post> {
  return api.get<Post>(`/admin/posts/${id}`);
}

export function createPost(dto: CreatePostDto): Promise<Post> {
  return api.post<Post>('/admin/posts', dto);
}

export function updatePost(id: string, dto: UpdatePostDto): Promise<Post> {
  return api.patch<Post>(`/admin/posts/${id}`, dto);
}
