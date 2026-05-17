import { api } from '@/shared/lib/http';
import type { ListPostsQuery, Post } from '../model/types';

export function listPosts(query: ListPostsQuery = {}): Promise<Post[]> {
  return api.get<Post[]>('/admin/posts', { status: query.status });
}

export function getPost(id: string): Promise<Post> {
  return api.get<Post>(`/admin/posts/${id}`);
}
