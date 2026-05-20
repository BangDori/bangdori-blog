/** @TODO 토스트 전용 컴포넌트로 변환 */

import { type ReactNode, useEffect } from 'react';
import { cn } from '@shared/lib/cn';

type ToastVariant = 'success' | 'error';

interface ToastProps {
  open: boolean;
  onClose: () => void;
  variant?: ToastVariant;
  durationMs?: number;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'border-border bg-secondary/95 text-foreground',
  error: 'border-destructive/40 bg-destructive/15 text-destructive',
};

export function Toast({
  open,
  onClose,
  variant = 'success',
  durationMs = 3000,
  children,
}: ToastProps) {
  useEffect(() => {
    if (!open || !durationMs) return;
    const t = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(t);
  }, [open, durationMs, onClose]);

  if (!open) return null;

  return (
    // biome-ignore lint/a11y/useSemanticElements: 변경 예정
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed right-4 top-4 z-50 rounded-md border px-4 py-2 text-sm shadow-md',
        VARIANT_CLASSES[variant],
      )}
    >
      {children}
    </div>
  );
}
