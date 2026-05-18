import type { ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

interface FieldProps {
  /** input/textarea 의 id 와 동일하게 — label htmlFor 로 연결된다. */
  htmlFor: string;
  label: string;
  required?: boolean;
  /** required 가 아닐 때 label 옆에 "선택" 같은 hint 를 띄우고 싶을 경우. */
  hint?: ReactNode;
  /** 빈 문자열이거나 undefined 면 에러 슬롯을 렌더링하지 않는다. */
  error?: string;
  className?: string;
  children: ReactNode;
}

/**
 * label + body(input/textarea) + 인라인 에러 메시지 슬롯을 가진 폼 필드.
 *
 * - 실제 input element 는 children 으로 받는다 (Input/Textarea 또는 임의 element).
 * - htmlFor 로 label 과 body 를 연결하므로, body element 의 id 와 동일하게 넘긴다.
 * - 에러 메시지는 `<p role="alert">` 로 렌더링되어 SR 에서 즉시 알려준다.
 */
export function Field({ htmlFor, label, required, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
        {!required && hint && <span className="ml-1.5 text-xs text-muted-foreground">{hint}</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
