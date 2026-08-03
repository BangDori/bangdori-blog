import type { SVGProps } from 'react';

export function RssIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      aria-hidden="true"
    >
      <path d="M6.18 15.64a2.18 2.18 0 1 1 0 4.36 2.18 2.18 0 0 1 0-4.36ZM4 4.44v3.57A12.01 12.01 0 0 1 15.99 20h3.57A15.57 15.57 0 0 0 4 4.44ZM4 10.1v3.57c3.5 0 6.33 2.84 6.33 6.33h3.57c0-5.47-4.43-9.9-9.9-9.9Z" />
    </svg>
  );
}
