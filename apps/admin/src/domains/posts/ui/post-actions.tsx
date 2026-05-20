import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@shared/lib/http';
import { ROUTES } from '@shared/lib/routes';
import { ErrorAlert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Toast } from '@shared/ui/toast';
import {
  describeArchivePostError,
  describeDeletePostError,
  describePublishPostError,
} from '../api/errors';
import { useArchivePost, useDeletePost, usePublishPost } from '../api/mutations';
import type { Post } from '../model/types';

interface PostActionsProps {
  post: Post;
  saveSlot?: ReactNode;
}

export function PostActions({ post, saveSlot }: PostActionsProps) {
  const navigate = useNavigate();
  const publishMutation = usePublishPost(post.id);
  const archiveMutation = useArchivePost(post.id);
  const deleteMutation = useDeletePost(post.id);

  const isPublished = post.status === 'published';
  const isArchived = post.status === 'archived';
  const isPublishing = publishMutation.isPending;
  const isArchiving = archiveMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isBusy = isPublishing || isArchiving || isDeleting;

  const publishLabel = post.status === 'archived' ? '다시 발행' : '발행';

  const [archivedAt, setArchivedAt] = useState<string | null>(null);

  const onPublish = () => {
    if (isPublished || isBusy) return;
    if (!window.confirm('이 글을 발행하시겠습니까?')) return;
    publishMutation.mutate();
  };

  const onArchive = () => {
    if (isArchived || isBusy) return;
    if (!window.confirm('이 글을 보관(archive)하시겠습니까?\n공개 목록에서 숨겨집니다.')) return;
    archiveMutation.mutate(undefined, {
      onSuccess: () => setArchivedAt(new Date().toISOString()),
    });
  };

  const onDelete = () => {
    if (isBusy) return;
    if (!window.confirm('이 글을 삭제하시겠습니까?\n삭제된 글은 목록에서 사라집니다.')) return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => navigate(ROUTES.posts),
    });
  };

  const publishError = publishMutation.error;
  const archiveError = archiveMutation.error;
  const deleteError = deleteMutation.error;

  const isPublishNotFound = publishError instanceof ApiError && publishError.status === 404;
  const isArchiveNotFound = archiveError instanceof ApiError && archiveError.status === 404;
  const isDeleteNotFound = deleteError instanceof ApiError && deleteError.status === 404;

  return (
    <section
      aria-label="포스트 액션"
      className="space-y-3 rounded-md border border-border bg-secondary/30 p-4"
    >
      <Toast open={!!archivedAt && !archiveError} onClose={() => setArchivedAt(null)}>
        보관되었습니다.
      </Toast>

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
            <Button onClick={onPublish} disabled={isBusy}>
              {isPublishing ? '발행 중…' : publishLabel}
            </Button>
          )}
          {isArchived ? (
            <Button variant="outline" disabled title="이미 보관된 글입니다">
              보관됨
            </Button>
          ) : (
            <Button variant="outline" onClick={onArchive} disabled={isBusy}>
              {isArchiving ? '보관 중…' : '보관'}
            </Button>
          )}
          <Button variant="destructive" onClick={onDelete} disabled={isBusy}>
            {isDeleting ? '삭제 중…' : '삭제'}
          </Button>
        </div>

        {saveSlot && <div className="flex flex-wrap items-center gap-3">{saveSlot}</div>}
      </div>

      {publishMutation.isSuccess && !publishError && (
        <div className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground">
          발행되었습니다.
        </div>
      )}

      {publishError && (
        <ErrorAlert>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{describePublishPostError(publishError)}</span>
            {isPublishNotFound && (
              <Button variant="outline" onClick={() => navigate(ROUTES.posts)}>
                목록으로
              </Button>
            )}
          </div>
        </ErrorAlert>
      )}

      {archiveError && (
        <ErrorAlert>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{describeArchivePostError(archiveError)}</span>
            {isArchiveNotFound && (
              <Button variant="outline" onClick={() => navigate(ROUTES.posts)}>
                목록으로
              </Button>
            )}
          </div>
        </ErrorAlert>
      )}

      {deleteError && (
        <ErrorAlert>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{describeDeletePostError(deleteError)}</span>
            {isDeleteNotFound && (
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
