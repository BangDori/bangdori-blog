import { GALogger } from '@/components/ga-logger';
import { getFeedItems } from '@/domains/post/api/posts';
import { PostList } from '@/domains/post/components';

export default async function Home() {
  const feedItems = await getFeedItems();

  return (
    <GALogger.OnScroll event={['post_list', { thresholds: [25, 50, 75, 100] }]}>
      <div className="container">
        <h1 className="sr-only">글 목록</h1>
        <PostList items={feedItems} />
      </div>
    </GALogger.OnScroll>
  );
}
