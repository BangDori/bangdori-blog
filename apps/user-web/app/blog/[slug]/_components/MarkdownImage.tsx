/* eslint-disable @next/next/no-img-element */
'use client';

import { type ImgHTMLAttributes, useState } from 'react';
import { Portal } from '@/components/Portal';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export function MarkdownImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { alt, ...rest } = props;
  const [isOpen, setIsOpen] = useState(false);

  useBodyScrollLock(isOpen);

  return (
    <>
      <img
        {...rest}
        alt={alt || 'image'}
        className="mb-2 cursor-pointer transition-opacity hover:opacity-80"
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <Portal>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setIsOpen(false)}
          >
            <img
              {...rest}
              src={rest.src}
              alt={alt || 'image'}
              className="mx-auto max-h-[80vh] cursor-pointer rounded-lg object-contain md:max-h-[85vh] lg:max-h-[90vh]"
            />
          </div>
        </Portal>
      )}
    </>
  );
}
