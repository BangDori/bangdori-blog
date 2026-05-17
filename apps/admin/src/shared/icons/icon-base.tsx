import type { ReactNode, SVGProps } from 'react';
import { cn } from '@/shared/lib/cn';

export type IconProps = SVGProps<SVGSVGElement>;

export function IconBase({ className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4', className)}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}
