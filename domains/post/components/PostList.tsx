import Link from 'next/link';
import { PostCard } from './PostCard';
import type { Post } from '../types';

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <div className="grid gap-2">
      {posts.map((post) => (
        <Link
          href={`/blog/${post.slug}`}
          key={post.id}
          className="rounded-sm px-0.5 py-1 transition-colors duration-200 ease-in-out hover:bg-gray-100"
        >
          <PostCard post={post} />
        </Link>
      ))}
    </div>
  );
}
