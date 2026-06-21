export type ExternalPostStatus = 'draft' | 'published' | 'archived';

export interface ExternalPost {
  id: string;
  title: string;
  url: string;
  source: string;
  category: string;
  status: ExternalPostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
