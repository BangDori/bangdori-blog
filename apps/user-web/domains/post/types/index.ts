export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface PostDetail extends PostListItem {
  contentMdx: string;
  author: string;
  createdAt: string;
}
