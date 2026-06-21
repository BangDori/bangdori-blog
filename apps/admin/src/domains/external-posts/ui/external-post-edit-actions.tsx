import { Button } from '@shared/ui/button';
import type { ExternalPost } from '../model/types';

interface ExternalPostEditActionsProps {
  post: ExternalPost;
  dirtyCount: number;
  disabled: boolean;
  isDirty: boolean;
  isArchiving: boolean;
  isDeleting: boolean;
  isPublishing: boolean;
  isSubmitting: boolean;
  onArchive: () => void;
  onDelete: () => void;
  onPublish: () => void;
}

export function ExternalPostEditActions({
  post,
  dirtyCount,
  disabled,
  isDirty,
  isArchiving,
  isDeleting,
  isPublishing,
  isSubmitting,
  onArchive,
  onDelete,
  onPublish,
}: ExternalPostEditActionsProps) {
  const isPublished = post.status === 'published';
  const isArchived = post.status === 'archived';
  const publishLabel = isArchived ? '다시 발행' : '발행';
  const statusActionDisabled = disabled || isDirty;

  return (
    <section
      aria-label="외부 글 수정 액션"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        {isPublished ? (
          <Button variant="outline" disabled title="이미 발행된 외부 글입니다">
            발행됨
          </Button>
        ) : (
          <Button onClick={onPublish} disabled={statusActionDisabled}>
            {isPublishing ? '발행 중…' : publishLabel}
          </Button>
        )}
        {isArchived ? (
          <Button variant="outline" disabled title="이미 보관된 외부 글입니다">
            보관됨
          </Button>
        ) : (
          <Button variant="outline" onClick={onArchive} disabled={statusActionDisabled}>
            {isArchiving ? '보관 중…' : '보관'}
          </Button>
        )}
        <Button variant="destructive" onClick={onDelete} disabled={disabled}>
          {isDeleting ? '삭제 중…' : '삭제'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {isDirty
            ? `변경된 필드: ${dirtyCount}개 · 변경 사항 저장 후 발행/보관할 수 있습니다.`
            : '변경 사항 없음'}
        </span>
        <Button type="submit" disabled={disabled || !isDirty}>
          {isSubmitting ? '저장 중…' : '저장하기'}
        </Button>
      </div>
    </section>
  );
}
