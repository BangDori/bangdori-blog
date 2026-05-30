export interface UserPostDetailDto {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  contentMdx: string;
  author: string;
  category: string;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
