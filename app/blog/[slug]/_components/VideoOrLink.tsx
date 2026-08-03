'use client';

import { trackClick } from '@/lib/gtag';

export function VideoOrLink({
  href,
  onClick,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isVideo = href?.match(/\.(mp4|webm|ogg|mov)(\?|$)/i);

  if (isVideo) {
    return (
      <video src={href} autoPlay muted controls>
        {`Sorry, your browser doesn${"'"}t support embedded videos.`}
      </video>
    );
  }

  const isExternal = href?.startsWith('http');

  return (
    <a
      href={href}
      {...rest}
      onClick={(event) => {
        if (isExternal) {
          trackClick('outbound_link', {
            url: href,
            text: typeof children === 'string' ? children : undefined,
          });
        }

        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
