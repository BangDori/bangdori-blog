import type { ReactNode } from 'react';

export function ErrorAlert({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {children}
    </div>
  );
}
