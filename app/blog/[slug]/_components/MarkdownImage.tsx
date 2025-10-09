/* eslint-disable @next/next/no-img-element */
'use client';

import { createPortal } from 'react-dom';
import { type ImgHTMLAttributes, useState, useEffect } from 'react';

export function MarkdownImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { alt, ...rest } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const imageElement = (
    <img
      {...rest}
      alt={alt || 'image'}
      className="mb-2 cursor-pointer transition-opacity hover:opacity-80"
      onClick={() => setIsOpen(true)}
    />
  );

  const modal =
    isOpen && mounted
      ? createPortal(
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
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {imageElement}
      {modal}
    </>
  );
}
