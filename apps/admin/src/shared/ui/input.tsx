import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@shared/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/**
 * 텍스트 input. 디자인 토큰(border / ring / input / destructive) 만 사용한다.
 *
 * - `invalid` true 일 때 border / ring 를 destructive 색상으로 전환한다.
 *   (Field 에 error 가 있을 때 함께 넘겨주는 것을 권장)
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, type = 'text', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'block w-full h-9 rounded-md border bg-background px-3 text-sm text-foreground',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:pointer-events-none',
        invalid
          ? 'border-destructive focus-visible:ring-destructive'
          : 'border-border focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  );
});
