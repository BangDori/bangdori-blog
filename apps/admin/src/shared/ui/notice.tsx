import type { ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

interface NoticeProps {
  className?: string;
  children: ReactNode;
}

export function Notice({ className, children }: NoticeProps) {
  return (
    <div
      className={cn('rounded-md border border-border p-6 text-sm text-muted-foreground', className)}
    >
      {children}
    </div>
  );
}
