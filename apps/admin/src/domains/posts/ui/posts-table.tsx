import { Link } from 'react-router-dom';
import { formatDateTime } from '@shared/lib/date';
import { ROUTES } from '@shared/lib/routes';
import type { Post } from '../model/types';
import { PostStatusBadge } from './post-status-badge';

interface PostsTableProps {
  rows: Post[];
  onRowClick: (id: string) => void;
}

export function PostsTable({ rows, onRowClick }: PostsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr className="text-left">
            <th className="px-3 py-2 font-medium">title</th>
            <th className="px-3 py-2 font-medium">status</th>
            <th className="px-3 py-2 font-medium">category</th>
            <th className="px-3 py-2 font-medium">author</th>
            <th className="px-3 py-2 font-medium whitespace-nowrap">publishedAt</th>
            <th className="px-3 py-2 font-medium whitespace-nowrap">updatedAt</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((post) => (
            <tr
              key={post.id}
              className="border-t border-border hover:bg-secondary/60 cursor-pointer"
              onClick={() => onRowClick(post.id)}
            >
              <td className="px-3 py-2">
                <Link
                  to={ROUTES.postEdit(post.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {post.title}
                </Link>
                <div className="text-xs text-muted-foreground">{post.slug}</div>
              </td>
              <td className="px-3 py-2">
                <PostStatusBadge status={post.status} />
              </td>
              <td className="px-3 py-2 text-muted-foreground">{post.category}</td>
              <td className="px-3 py-2 text-muted-foreground">{post.author}</td>
              <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                {formatDateTime(post.publishedAt)}
              </td>
              <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                {formatDateTime(post.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
