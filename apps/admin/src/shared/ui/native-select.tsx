import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@shared/lib/cn';

interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly string[];
  invalid?: boolean;
  placeholder?: string;
}

/**
 * Native `<select>` 기반 드롭다운.
 *
 * - 옵션 수 제한 없고 모바일에서는 OS picker 가 떠 접근성·확장성 모두 무난.
 * - forwardRef 로 react-hook-form 의 `{...register('field')}` spread 와 호환.
 * - 빈 값(value="") 상태에서는 `disabled` 인 placeholder option 으로 "선택" 상태를
 *   표현하고, 텍스트 색을 muted 로 낮춰 시각적으로 구분한다.
 * - `invalid` true 면 border / focus ring 을 destructive 색상으로 전환.
 *
 * label/value 가 갈리는 케이스(예: `{ label: '강병준', value: 'kbj' }`) 가 생기면
 * `options: readonly { value: string; label: string }[]` 로 시그니처를 확장한다.
 * 그 전까지는 단일 string 배열로 충분.
 */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { options, invalid, placeholder = '선택', className, value, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      value={value}
      aria-invalid={invalid || undefined}
      className={cn(
        'block h-9 w-full rounded-md border bg-background px-3 text-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:pointer-events-none',
        value === '' || value === undefined ? 'text-muted-foreground' : 'text-foreground',
        invalid
          ? 'border-destructive focus-visible:ring-destructive'
          : 'border-border focus-visible:ring-ring',
        className,
      )}
      {...rest}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
});
