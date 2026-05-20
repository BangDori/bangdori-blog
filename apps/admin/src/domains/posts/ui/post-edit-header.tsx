import { Link } from 'react-router-dom';
import { formatDateTime } from '@shared/lib/date';
import { ROUTES } from '@shared/lib/routes';

interface PostEditHeaderProps {
  viewCount: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  deletedAt: string | null;
}

export function PostEditHeader({
  viewCount,
  createdAt,
  updatedAt,
  publishedAt,
  deletedAt,
}: PostEditHeaderProps) {
  return (
    <header className="space-y-3">
      <Link
        to={ROUTES.posts}
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
      >
        ← 목록으로
      </Link>

      <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
        <span>조회수 {viewCount}</span>
        <span aria-hidden>·</span>
        <span>생성 {formatDateTime(createdAt)}</span>
        <span aria-hidden>·</span>
        <span>수정 {formatDateTime(updatedAt)}</span>
        <span aria-hidden>·</span>
        <span>발행 {formatDateTime(publishedAt)}</span>
        {deletedAt && (
          <>
            <span aria-hidden>·</span>
            <span>삭제 {formatDateTime(deletedAt)}</span>
          </>
        )}
      </p>
    </header>
  );
}
