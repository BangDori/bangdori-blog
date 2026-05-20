import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreatePostDto, UpdatePostDto } from '../model/schema';
import type { Post } from '../model/types';
import { archivePost, createPost, deletePost, publishPost, updatePost } from './index';
import { postsKeys } from './keys';

export function useCreatePost() {
  const qc = useQueryClient();

  return useMutation<Post, Error, CreatePostDto>({
    mutationFn: (dto) => createPost(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
}

export function useUpdatePost(id: string) {
  const qc = useQueryClient();

  return useMutation<Post, Error, UpdatePostDto>({
    mutationFn: (dto) => updatePost(id, dto),
    onSuccess: (next) => {
      qc.setQueryData(postsKeys.detail(id), next);
      qc.invalidateQueries({ queryKey: postsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
}

export function usePublishPost(id: string) {
  const qc = useQueryClient();

  return useMutation<Post, Error, void>({
    mutationKey: postsKeys.publishMutation(id),
    mutationFn: () => publishPost(id),
    onSuccess: (next) => {
      qc.setQueryData(postsKeys.detail(id), next);
      qc.invalidateQueries({ queryKey: postsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
}

export function useArchivePost(id: string) {
  const qc = useQueryClient();

  return useMutation<Post, Error, void>({
    mutationKey: postsKeys.archiveMutation(id),
    mutationFn: () => archivePost(id),
    onSuccess: (next) => {
      qc.setQueryData(postsKeys.detail(id), next);
      qc.invalidateQueries({ queryKey: postsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
}

export function useDeletePost(id: string) {
  const qc = useQueryClient();

  return useMutation<void, Error, void>({
    mutationKey: postsKeys.deleteMutation(id),
    mutationFn: () => deletePost(id),
    onSuccess: () => {
      qc.removeQueries({ queryKey: postsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
}
