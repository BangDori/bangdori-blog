export type PostStatus = 'draft' | 'published' | 'archived';

export interface Post {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  contentMdx: string;
  status: PostStatus;
  author: string;
  category: string;
  thumbnailUrl: string | null;
  viewCount: string;
  publishedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListPostsQueryDto {
  status?: PostStatus;
}
