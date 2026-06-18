import { useQuery } from '@tanstack/react-query';
import { getExternalPost, listExternalPosts } from './index';
import { externalPostsKeys } from './keys';

export function useListExternalPosts() {
  return useQuery({
    queryKey: externalPostsKeys.list(),
    queryFn: () => listExternalPosts(),
  });
}

export function useGetExternalPost(id: string) {
  return useQuery({
    queryKey: externalPostsKeys.detail(id),
    queryFn: () => getExternalPost(id),
    enabled: !!id,
  });
}
