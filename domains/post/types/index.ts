export interface Post {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  tag: string;
  createdAt: string;
  updatedAt?: string;
  slug: string;
}
