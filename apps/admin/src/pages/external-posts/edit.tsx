import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import invariant from 'tiny-invariant';
import {
  ExternalPostEditForm,
  ExternalPostEditHeader,
  useGetExternalPost,
} from '@domains/external-posts';
import { ApiError, formatError } from '@shared/lib/http';
import { ROUTES } from '@shared/lib/routes';
import { Button } from '@shared/ui/button';
import { Notice } from '@shared/ui/notice';
import { QueryBoundary } from '@shared/ui/query-boundary';

export function ExternalPostsEditPage() {
  const { id } = useParams<{ id: string }>();
  invariant(id, 'external posts edit route에서는 id 파라미터가 반드시 존재해야 합니다.');
  const navigate = useNavigate();
  const query = useGetExternalPost(id);

  return (
    <QueryBoundary
      query={query}
      loading={<Notice>불러오는 중…</Notice>}
      onError={(err) => {
        if (err instanceof ApiError && err.status === 404) return;
        toast.error(formatError(err));
      }}
      error={(err) => {
        if (err instanceof ApiError && err.status === 404) {
          return (
            <div className="space-y-4">
              <Notice>외부 글을 찾을 수 없습니다.</Notice>
              <Button variant="outline" onClick={() => navigate(ROUTES.externalPosts)}>
                목록으로 돌아가기
              </Button>
            </div>
          );
        }
        return <Notice>외부 글을 불러올 수 없습니다.</Notice>;
      }}
    >
      {(post) => (
        <div className="space-y-8">
          <ExternalPostEditHeader
            createdAt={post.createdAt}
            updatedAt={post.updatedAt}
            publishedAt={post.publishedAt}
          />
          <ExternalPostEditForm post={post} />
        </div>
      )}
    </QueryBoundary>
  );
}
