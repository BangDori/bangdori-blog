import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreatePostDto } from '../model/schema';
import type { Post } from '../model/types';
import { createPost } from './index';
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
