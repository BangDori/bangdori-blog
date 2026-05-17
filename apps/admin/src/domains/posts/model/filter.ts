import { POST_STATUS_VALUES } from './constants';
import type { PostStatus } from './types';

export type PostsFilter = 'all' | PostStatus;

const VALID_FILTERS = new Set<PostsFilter>(['all', ...POST_STATUS_VALUES]);

export function parsePostsFilter(value: string | null | undefined): PostsFilter {
  return value && VALID_FILTERS.has(value as PostsFilter) ? (value as PostsFilter) : 'all';
}
