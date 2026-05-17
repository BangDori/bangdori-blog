import { useNavigate, useSearchParams } from 'react-router-dom';
import { type PostsFilter, PostsList, PostsStatusFilter, parsePostsFilter } from '@/domains/posts';
import { ROUTES } from '@/shared/lib/routes';
import { Button } from '@/shared/ui/button';

export function PostsListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const filter = parsePostsFilter(params.get('status'));

  const updateFilter = (next: PostsFilter) => {
    const sp = new URLSearchParams(params);

    if (next === 'all') sp.delete('status');
    else sp.set('status', next);

    setParams(sp, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
        <Button onClick={() => navigate(ROUTES.postsNew)}>새 글 작성</Button>
      </div>

      <PostsStatusFilter value={filter} onChange={updateFilter} />

      <PostsList filter={filter} onRowClick={(id) => navigate(ROUTES.postEdit(id))} />
    </div>
  );
}
