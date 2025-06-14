export interface Post {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  tag: string;
  date?: string;
  modifiedDate?: string;
  slug: string;
}
