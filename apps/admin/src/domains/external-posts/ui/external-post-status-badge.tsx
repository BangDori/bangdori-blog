import { cn } from '@shared/lib/cn';
import type { ExternalPostStatus } from '../model/types';

const STATUS_LABEL: Record<ExternalPostStatus, string> = {
  draft: '초안',
  published: '발행',
  archived: '보관',
};

const STATUS_CLASS: Record<ExternalPostStatus, string> = {
  draft: 'bg-secondary text-secondary-foreground',
  published: 'bg-accent text-accent-foreground',
  archived: 'bg-muted text-muted-foreground',
};

export function ExternalPostStatusBadge({ status }: { status: ExternalPostStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium',
        STATUS_CLASS[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
