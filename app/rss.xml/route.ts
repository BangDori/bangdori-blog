import RSS from 'rss';
import { getPublishedPosts } from '@/domains/post/api/notion';
import { Post } from '@/domains/post/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export async function GET() {
  const feed = new RSS({
    title: '강병준의 개발 블로그',
    description: '프론트엔드 개발자 강병준의 개발 블로그입니다.',
    feed_url: `${SITE_URL}/rss.xml`,
    site_url: `${SITE_URL}`,
    language: 'ko',
  });

  const posts: Post[] = await getPublishedPosts();

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.description || '',
      url: `${SITE_URL}/blog/${post.slug}`,
      guid: `${SITE_URL}/blog/${post.slug}`,
      date: post.createdAt,
      author: '강병준',
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
