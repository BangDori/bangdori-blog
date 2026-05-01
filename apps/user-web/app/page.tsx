import { getPublishedPosts } from '@/domains/post/api/notion';
import { PostList } from '@/domains/post/components';

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <div className="container">
      <PostList posts={posts} />
    </div>
  );
}
