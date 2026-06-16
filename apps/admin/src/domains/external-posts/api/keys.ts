export const externalPostsKeys = {
  all: ['external-posts'] as const,
  lists: () => [...externalPostsKeys.all, 'list'] as const,
  list: () => [...externalPostsKeys.lists()] as const,
  details: () => [...externalPostsKeys.all, 'detail'] as const,
  detail: (id: string) => [...externalPostsKeys.details(), id] as const,
  deleteMutation: (id: string) => [...externalPostsKeys.detail(id), 'delete'] as const,
};
