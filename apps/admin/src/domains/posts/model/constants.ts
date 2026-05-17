import type { PostStatus } from './types';

export const POST_STATUS_VALUES: PostStatus[] = ['draft', 'published', 'archived'];

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  draft: '초안',
  published: '발행',
  archived: '보관',
};
