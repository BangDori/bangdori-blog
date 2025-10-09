/* eslint-disable @next/next/no-img-element */
'use client';

import { type ImgHTMLAttributes, useState } from 'react';

export function MarkdownImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { alt, ...rest } = props;
  const [isOpen, setIsOpen] = useState(false);

  const imageElement = (
    <img
      {...rest}
      alt={alt || 'image'}
      className="mb-2 cursor-pointer transition-opacity hover:opacity-80"
      onClick={() => setIsOpen(true)}
    />
  );

  return (
    <>
      {imageElement}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsOpen(false)}
        >
          <img
            {...rest}
            src={rest.src}
            alt={alt || 'image'}
            className="image-expanded cursor-pointer object-contain"
          />
        </div>
      )}
    </>
  );
}
