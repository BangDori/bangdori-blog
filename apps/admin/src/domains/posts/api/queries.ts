import { useQuery } from '@tanstack/react-query';
import type { ListPostsQuery } from '../model/types';
import { getPost, listPosts } from './index';

const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (q: ListPostsQuery) => [...postsKeys.lists(), q] as const,
  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (id: string) => [...postsKeys.details(), id] as const,
};

export function useListPosts(query: ListPostsQuery) {
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
