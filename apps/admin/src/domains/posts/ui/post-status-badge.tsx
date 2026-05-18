import { cn } from '@shared/lib/cn';
import { POST_STATUS_LABEL } from '../model/constants';
import type { PostStatus } from '../model/types';

const STATUS_CLASS: Record<PostStatus, string> = {
  draft: 'bg-secondary text-secondary-foreground',
  published: 'bg-accent text-accent-foreground',
  archived: 'bg-muted text-muted-foreground',
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium',
        STATUS_CLASS[status],
      )}
    >
      {POST_STATUS_LABEL[status]}
    </span>
  );
}
