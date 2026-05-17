import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostsList, PostsStatusFilter, type PostsFilter } from '@/domains/posts';
import { Button } from '@/shared/ui/button';

export function PostsListPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PostsFilter>('all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
        <Button onClick={() => navigate('/posts/new')}>새 글 작성</Button>
      </div>

      <PostsStatusFilter value={filter} onChange={setFilter} />

      <PostsList filter={filter} onRowClick={(id) => navigate(`/posts/${id}/edit`)} />
    </div>
  );
}
