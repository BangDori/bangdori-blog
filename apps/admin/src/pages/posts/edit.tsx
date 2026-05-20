import { useNavigate, useParams } from 'react-router-dom';
import invariant from 'tiny-invariant';
import { PostEditForm, PostEditHeader, useGetPost } from '@domains/posts';
import { ApiError, formatError } from '@shared/lib/http';
import { ROUTES } from '@shared/lib/routes';
import { ErrorAlert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Notice } from '@shared/ui/notice';
import { QueryBoundary } from '@shared/ui/query-boundary';

export function PostsEditPage() {
  const { id } = useParams<{ id: string }>();
  invariant(id, 'posts edit route에서는 id 파라미터가 반드시 존재해야 합니다.');
  const navigate = useNavigate();
  const query = useGetPost(id);

  return (
    <QueryBoundary
      query={query}
      loading={<Notice>불러오는 중…</Notice>}
      error={(err) => {
        if (err instanceof ApiError && err.status === 404) {
          return (
            <div className="space-y-4">
              <Notice>글을 찾을 수 없습니다.</Notice>
              <Button variant="outline" onClick={() => navigate(ROUTES.posts)}>
                목록으로 돌아가기
              </Button>
            </div>
          );
        }
        return <ErrorAlert>{formatError(err)}</ErrorAlert>;
      }}
    >
      {(post) => (
        <div className="space-y-8">
          <PostEditHeader
            viewCount={post.viewCount}
            createdAt={post.createdAt}
            updatedAt={post.updatedAt}
            publishedAt={post.publishedAt}
            deletedAt={post.deletedAt}
          />
          <PostEditForm post={post} />
        </div>
      )}
    </QueryBoundary>
  );
}
