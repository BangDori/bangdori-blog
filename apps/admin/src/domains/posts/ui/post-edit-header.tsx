import { Link } from 'react-router-dom';
import { formatDateTime } from '@shared/lib/date';
import { ROUTES } from '@shared/lib/routes';
import { Button } from '@shared/ui/button';
import type { PostStatus } from '../model/types';
import { PostStatusBadge } from './post-status-badge';

interface PostEditHeaderProps {
  status: PostStatus;
  viewCount: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  deletedAt: string | null;
}

export function PostEditHeader({
  status,
  viewCount,
  createdAt,
  updatedAt,
  publishedAt,
  deletedAt,
}: PostEditHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={ROUTES.posts}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
        >
          ← 목록으로
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <PostStatusBadge status={status} />
          {/* TODO(next PR): POST /admin/posts/:id/publish */}
          <Button variant="outline" disabled title="다음 PR에서 publish endpoint 연결">
            발행
          </Button>
          {/* TODO(next PR): POST /admin/posts/:id/archive */}
          <Button variant="outline" disabled title="다음 PR에서 archive endpoint 연결">
            보관
          </Button>
          {/* TODO(next PR): DELETE /admin/posts/:id */}
          <Button variant="destructive" disabled title="다음 PR에서 delete endpoint 연결">
            삭제
          </Button>
        </div>
      </div>

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
