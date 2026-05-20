import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@shared/lib/http';
import { ROUTES } from '@shared/lib/routes';
import { ErrorAlert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { describePublishPostError } from '../api/errors';
import { usePublishPost } from '../api/mutations';
import type { Post } from '../model/types';

interface PostActionsProps {
  post: Post;
  saveSlot?: ReactNode;
}

export function PostActions({ post, saveSlot }: PostActionsProps) {
  const navigate = useNavigate();
  const publishMutation = usePublishPost(post.id);

  const isPublished = post.status === 'published';
  const isPublishing = publishMutation.isPending;
  const publishLabel = post.status === 'archived' ? '다시 발행' : '발행';

  const onPublish = () => {
    if (isPublished || isPublishing) return;
    if (!window.confirm('이 글을 발행하시겠습니까?')) return;
    publishMutation.mutate();
  };

  const error = publishMutation.error;
  const isNotFound = error instanceof ApiError && error.status === 404;

  return (
    <section
      aria-label="포스트 액션"
      className="space-y-3 rounded-md border border-border bg-secondary/30 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {isPublished ? (
            <>
              <Button variant="outline" disabled title="이미 발행된 글입니다">
                발행됨
              </Button>
              <span className="text-xs text-muted-foreground">이미 발행된 글입니다.</span>
            </>
          ) : (
            <Button onClick={onPublish} disabled={isPublishing}>
              {isPublishing ? '발행 중…' : publishLabel}
            </Button>
          )}
          {/* TODO(next PR): POST /admin/posts/:id/archive */}
          <Button variant="outline" disabled title="다음 PR에서 archive endpoint 연결">
            보관
          </Button>
          {/* TODO(next PR): DELETE /admin/posts/:id */}
          <Button variant="destructive" disabled title="다음 PR에서 delete endpoint 연결">
            삭제
          </Button>
        </div>

        {saveSlot && <div className="flex flex-wrap items-center gap-3">{saveSlot}</div>}
      </div>

      {publishMutation.isSuccess && !error && (
        <div className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground">
          발행되었습니다.
        </div>
      )}

      {error && (
        <ErrorAlert>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{describePublishPostError(error)}</span>
            {isNotFound && (
              <Button variant="outline" onClick={() => navigate(ROUTES.posts)}>
                목록으로
              </Button>
            )}
          </div>
        </ErrorAlert>
      )}
    </section>
  );
}
