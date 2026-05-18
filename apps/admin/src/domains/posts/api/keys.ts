import type { ListPostsQueryDto } from '../model/types';

export const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (q: ListPostsQueryDto) => [...postsKeys.lists(), q] as const,
  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (id: string) => [...postsKeys.details(), id] as const,
};
