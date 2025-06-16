/* eslint-disable @next/next/no-img-element */
import { type ImgHTMLAttributes } from 'react';

export function MarkdownImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { alt, ...rest } = props;

  if (alt) {
    return (
      <>
        <img {...rest} alt={alt} className="mb-2" />
        <span className="text-muted-foreground block text-center text-sm">{alt}</span>
      </>
    );
  }

  return <img {...rest} alt="image" />;
}
