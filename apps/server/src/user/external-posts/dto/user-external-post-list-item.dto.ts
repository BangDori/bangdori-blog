export interface UserExternalPostListItemDto {
  id: string;
  title: string;
  url: string;
  source: string;
  category: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
