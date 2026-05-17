import { cn } from '@/shared/lib/cn';
import { POST_STATUS_LABEL, POST_STATUS_VALUES } from '../model/constants';
import type { PostsFilter } from '../model/filter';

const FILTERS: { value: PostsFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  ...POST_STATUS_VALUES.map((s) => ({ value: s as PostsFilter, label: POST_STATUS_LABEL[s] })),
];

interface Props {
  value: PostsFilter;
  onChange: (next: PostsFilter) => void;
}

export function PostsStatusFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((f) => {
        const active = value === f.value;
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            className={cn(
              'inline-flex h-8 items-center rounded-md px-3 text-sm transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background text-foreground hover:bg-secondary',
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
