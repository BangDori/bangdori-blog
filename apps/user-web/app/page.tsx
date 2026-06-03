import { GALogger } from '@/components/ga-logger';
import { getPublishedPosts } from '@/domains/post/api/posts';
import { PostList } from '@/domains/post/components';

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
