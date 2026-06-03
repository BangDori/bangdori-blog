export interface UserPostListItemDto {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  updatedAt: string;
}
