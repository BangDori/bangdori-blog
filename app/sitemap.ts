import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/domains/post/api/notion';
import { absoluteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/books'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const posts = await getPublishedPosts();
  const blogPosts: MetadataRoute.Sitemap = posts
    .filter((post) => post.status === 'Published')
    .map((post) => ({
      url: absoluteUrl(`/blog/${encodeURIComponent(post.slug)}`),
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...staticPages, ...blogPosts];
}
