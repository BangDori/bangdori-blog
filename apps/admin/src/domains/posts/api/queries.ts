import { useQuery } from '@tanstack/react-query';
import type { ListPostsQueryDto } from '../model/types';
import { getPost, listPosts } from './index';
import { postsKeys } from './keys';

export function useListPosts(query: ListPostsQueryDto) {
  return useQuery({
    queryKey: postsKeys.list(query),
    queryFn: () => listPosts(query),
  });
}

export function useGetPost(id: string) {
  return useQuery({
    queryKey: postsKeys.detail(id),
    queryFn: () => getPost(id),
    enabled: !!id,
  });
}
