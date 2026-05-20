import { toast } from 'sonner';
import { formatError } from '@shared/lib/http';
import { Notice } from '@shared/ui/notice';
import { QueryBoundary } from '@shared/ui/query-boundary';
import { useListPosts } from '../api/queries';
import type { PostsFilter } from '../model/filter';
import { PostsTable } from './posts-table';

interface PostsListProps {
  filter: PostsFilter;
  onRowClick: (id: string) => void;
}

export function PostsList({ filter, onRowClick }: PostsListProps) {
  const query = useListPosts({ status: filter === 'all' ? undefined : filter });

  return (
    <QueryBoundary
      query={query}
      loading={<Notice>불러오는 중…</Notice>}
      error={() => <Notice>목록을 불러올 수 없습니다.</Notice>}
      onError={(err) => toast.error(formatError(err))}
      isEmpty={(data) => data.length === 0}
      empty={<Notice>글이 없습니다.</Notice>}
    >
      {(data) => <PostsTable rows={data} onRowClick={onRowClick} />}
    </QueryBoundary>
  );
}
