import { toast } from 'sonner';
import { formatError } from '@shared/lib/http';
import { Notice } from '@shared/ui/notice';
import { QueryBoundary } from '@shared/ui/query-boundary';
import { useListExternalPosts } from '../api/queries';
import { ExternalPostsTable } from './external-posts-table';

interface ExternalPostsListProps {
  onRowClick: (id: string) => void;
}

export function ExternalPostsList({ onRowClick }: ExternalPostsListProps) {
  const query = useListExternalPosts();

  return (
    <QueryBoundary
      query={query}
      loading={<Notice>불러오는 중…</Notice>}
      error={() => <Notice>목록을 불러올 수 없습니다.</Notice>}
      onError={(err) => toast.error(formatError(err))}
      isEmpty={(data) => data.length === 0}
      empty={<Notice>외부 글이 없습니다.</Notice>}
    >
      {(data) => <ExternalPostsTable rows={data} onRowClick={onRowClick} />}
    </QueryBoundary>
  );
}
