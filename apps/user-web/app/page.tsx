import { GALogger } from '@/components/ga-logger';
import { getPublishedPosts } from '@/domains/post/api/posts';
import { PostList } from '@/domains/post/components';

// docker build 명종 방지: 빌드 시 API 서버가 없으므로 prerender 대신 런타임 생성
export const dynamic = 'force-dynamic';

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <GALogger.OnScroll event={['post_list', { thresholds: [25, 50, 75, 100] }]}>
      <div className="container">
        <PostList posts={posts} />
      </div>
    </GALogger.OnScroll>
  );
}
