import { api } from '@shared/lib/http';
import type { CreateExternalPostDto, UpdateExternalPostDto } from '../model/schema';
import type { ExternalPost } from '../model/types';

export function listExternalPosts(): Promise<ExternalPost[]> {
  return api.get<ExternalPost[]>('/admin/external-posts');
}

export function getExternalPost(id: string): Promise<ExternalPost> {
  return api.get<ExternalPost>(`/admin/external-posts/${id}`);
}

export function createExternalPost(dto: CreateExternalPostDto): Promise<ExternalPost> {
  return api.post<ExternalPost>('/admin/external-posts', dto);
}

export function updateExternalPost(id: string, dto: UpdateExternalPostDto): Promise<ExternalPost> {
  return api.patch<ExternalPost>(`/admin/external-posts/${id}`, dto);
}

export function deleteExternalPost(id: string): Promise<void> {
  return api.delete<void>(`/admin/external-posts/${id}`);
}
