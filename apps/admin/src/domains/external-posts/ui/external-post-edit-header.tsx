import { Link } from 'react-router-dom';
import { formatDateTime } from '@shared/lib/date';
import { ROUTES } from '@shared/lib/routes';

interface ExternalPostEditHeaderProps {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export function ExternalPostEditHeader({
  createdAt,
  updatedAt,
  publishedAt,
}: ExternalPostEditHeaderProps) {
  return (
    <header className="space-y-3">
      <Link
        to={ROUTES.externalPosts}
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
      >
        ← 목록으로
      </Link>

      <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
        <span>생성 {formatDateTime(createdAt)}</span>
        <span aria-hidden>·</span>
        <span>수정 {formatDateTime(updatedAt)}</span>
        <span aria-hidden>·</span>
        <span>발행 {formatDateTime(publishedAt)}</span>
      </p>
    </header>
  );
}
