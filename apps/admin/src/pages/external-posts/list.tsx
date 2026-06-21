import { useNavigate } from 'react-router-dom';
import { ExternalPostsList } from '@domains/external-posts';
import { ROUTES } from '@shared/lib/routes';
import { Button } from '@shared/ui/button';

export function ExternalPostsListPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">External Posts</h1>
        <Button onClick={() => navigate(ROUTES.externalPostsNew)}>새 외부 글 등록</Button>
      </div>

      <ExternalPostsList />
    </div>
  );
}
