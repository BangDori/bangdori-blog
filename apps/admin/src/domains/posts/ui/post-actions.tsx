import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiError } from '@shared/lib/http';
import { ROUTES } from '@shared/lib/routes';
import { Button } from '@shared/ui/button';
import {
  describeArchivePostError,
  describeDeletePostError,
  describePublishPostError,
} from '../api/errors';
import { useArchivePost, useDeletePost, usePublishPost } from '../api/mutations';
import type { Post } from '../model/types';

/** 404 응답일 때만 toast에 "목록으로" 액션을 붙여준다 */
function notFoundAction(err: Error, onClick: () => void) {
  if (err instanceof ApiError && err.status === 404) {
    return { action: { label: '목록으로', onClick } };
  }
  return undefined;
}

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
  const goToList = () => navigate(ROUTES.posts);

  const onPublish = () => {
    if (isPublished || isBusy) return;
    if (!window.confirm('이 글을 발행하시겠습니까?')) return;
    publishMutation.mutate(undefined, {
      onSuccess: () => toast.success('발행되었습니다.'),
      onError: (err) => toast.error(describePublishPostError(err), notFoundAction(err, goToList)),
    });
  };

  const onArchive = () => {
    if (isArchived || isBusy) return;
    if (!window.confirm('이 글을 보관(archive)하시겠습니까?\n공개 목록에서 숨겨집니다.')) return;
    archiveMutation.mutate(undefined, {
      onSuccess: () => toast.success('보관되었습니다.'),
      onError: (err) => toast.error(describeArchivePostError(err), notFoundAction(err, goToList)),
    });
  };

  const onDelete = () => {
    if (isBusy) return;
    if (!window.confirm('이 글을 삭제하시겠습니까?\n삭제된 글은 목록에서 사라집니다.')) return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('삭제되었습니다.');
        navigate(ROUTES.posts);
      },
      onError: (err) => toast.error(describeDeletePostError(err), notFoundAction(err, goToList)),
    });
  };

  return (
    <section
      aria-label="포스트 액션"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-4"
    >
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
    </section>
  );
}
