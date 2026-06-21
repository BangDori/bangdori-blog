import { Link } from 'react-router-dom';
import { formatDateTime } from '@shared/lib/date';
import { ROUTES } from '@shared/lib/routes';
import type { ExternalPost } from '../model/types';
import { ExternalPostSourceBadge } from './external-post-source-badge';
import { ExternalPostStatusBadge } from './external-post-status-badge';

interface ExternalPostsTableProps {
  rows: ExternalPost[];
}

export function ExternalPostsTable({ rows }: ExternalPostsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <caption className="sr-only">외부 글 목록</caption>
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
            <tr key={post.id} className="border-t border-border hover:bg-secondary/60">
              <td className="px-3 py-2">
                <Link
                  to={ROUTES.externalPostEdit(post.id)}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {post.title}
                </Link>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${post.title} 원문 새 탭에서 열기`}
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
