'use client';

import { type ImgHTMLAttributes, useState } from 'react';
import { Portal } from '@/components/Portal';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { trackClick } from '@/lib/gtag';

export function MarkdownImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { alt, src, ...rest } = props;
  const [isOpen, setIsOpen] = useState(false);

  useBodyScrollLock(isOpen);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          trackClick('image', { url: typeof src === 'string' ? src : undefined, text: alt });
          setIsOpen(true);
        }}
        className="cursor-pointer"
      >
        <img
          {...rest}
          src={src}
          alt={alt || 'image'}
          className="mb-2 transition-opacity hover:opacity-80"
        />
      </button>
      {isOpen && (
        <Portal>
          <button
            type="button"
            className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/80 p-4"
            onClick={() => setIsOpen(false)}
          >
            <img
              {...rest}
              src={src}
              alt={alt || 'image'}
              className="mx-auto max-h-[80vh] cursor-pointer rounded-lg object-contain md:max-h-[85vh] lg:max-h-[90vh]"
            />
          </button>
        </Portal>
      )}
    </>
  );
}
