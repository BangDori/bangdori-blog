import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreatePostDto, UpdatePostDto } from '../model/schema';
import type { Post } from '../model/types';
import { createPost, updatePost } from './index';
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
