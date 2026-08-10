import { GALogger } from '@/components/ga-logger';
import { JsonLd } from '@/components/JsonLd';
import { getPublishedPosts } from '@/domains/post/api/notion';
import { PostList } from '@/domains/post/components';
import { createWebsiteJsonLd } from '@/lib/structured-data';

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <GALogger.OnScroll event={['post_list', { thresholds: [25, 50, 75, 100] }]}>
      <div className="container">
        <JsonLd data={createWebsiteJsonLd()} />
        <h1 className="sr-only">강병준 개발 블로그 글 목록</h1>
        <PostList posts={posts} />
      </div>
    </GALogger.OnScroll>
  );
}
