'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { trackClick } from '@/lib/gtag';

interface ShareButtonProps {
  title: string;
  text?: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard API를 지원하지 않는 브라우저를 위한 fallback
      const textArea = document.createElement('textarea');

      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    setCopied(true);
    trackClick('copy_link', { source: 'share_fallback' });
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (typeof navigator.share !== 'function') {
      await copyLink();
      return;
    }

    try {
      await navigator.share({ title, text, url });
      trackClick('social', { source: 'native_share', title, url });
    } catch (error) {
      // 공유창을 직접 닫은 경우에는 링크를 복사하지 않는다.
      if (error instanceof DOMException && error.name === 'AbortError') return;

      await copyLink();
    }
  };

  return (
    <Button
      type="button"
      className="text-muted-foreground cursor-pointer text-sm"
      onClick={handleShare}
      aria-label="글 공유하기"
      variant="ghost"
    >
      {copied ? '✅ 링크 복사됨' : '공유하기'}
    </Button>
  );
}
