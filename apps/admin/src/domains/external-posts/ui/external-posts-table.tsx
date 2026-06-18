import { Link } from 'react-router-dom';
import { formatDateTime } from '@shared/lib/date';
import { ROUTES } from '@shared/lib/routes';
import type { ExternalPost } from '../model/types';
import { ExternalPostSourceBadge } from './external-post-source-badge';
import { ExternalPostStatusBadge } from './external-post-status-badge';

interface ExternalPostsTableProps {
  rows: ExternalPost[];
  onRowClick: (id: string) => void;
}

export function ExternalPostsTable({ rows, onRowClick }: ExternalPostsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr className="text-left">
            <th scope="col" className="px-3 py-2 font-medium">
              title
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              status
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              source
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              category
            </th>
            <th scope="col" className="px-3 py-2 font-medium whitespace-nowrap">
              publishedAt
            </th>
            <th scope="col" className="px-3 py-2 font-medium whitespace-nowrap">
              updatedAt
            </th>
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
                  to={ROUTES.externalPostEdit(post.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {post.title}
                </Link>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block max-w-xl truncate text-xs text-muted-foreground hover:text-primary"
                >
                  {post.url}
                </a>
              </td>
              <td className="px-3 py-2">
                <ExternalPostStatusBadge status={post.status} />
              </td>
              <td className="px-3 py-2">
                <ExternalPostSourceBadge source={post.source} />
              </td>
              <td className="px-3 py-2 text-muted-foreground">{post.category}</td>
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
