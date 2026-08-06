'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { trackClick } from '@/lib/gtag';

interface ShareButtonProps {
  title: string;
  text?: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const isSharingRef = useRef(false);

  const copyLink = async () => {
    let copySucceeded = false;

    try {
      await navigator.clipboard.writeText(window.location.href);
      copySucceeded = true;
    } catch {
      // Clipboard API를 지원하지 않는 브라우저를 위한 fallback
      const textArea = document.createElement('textarea');

      textArea.value = window.location.href;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);

      try {
        textArea.focus();
        textArea.select();
        copySucceeded = document.execCommand('copy');
      } catch {
        copySucceeded = false;
      } finally {
        textArea.remove();
      }
    }

    if (!copySucceeded) return;

    setCopied(true);
    trackClick('copy_link', { source: 'share_fallback' });
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    if (isSharingRef.current) return;

    isSharingRef.current = true;
    setIsSharing(true);

    const url = window.location.href;

    try {
      if (typeof navigator.share !== 'function') {
        await copyLink();
        return;
      }

      await navigator.share({ title, text, url });
      trackClick('social', { source: 'native_share', title, url });
    } catch (error) {
      // 공유창을 직접 닫은 경우에는 링크를 복사하지 않는다.
      if (error instanceof DOMException && error.name === 'AbortError') return;

      await copyLink();
    } finally {
      isSharingRef.current = false;
      setIsSharing(false);
    }
  };

  return (
    <Button
      type="button"
      className="text-muted-foreground cursor-pointer text-sm"
      onClick={handleShare}
      disabled={isSharing}
      variant="ghost"
    >
      {copied ? '✅ 링크 복사됨' : '공유하기'}
    </Button>
  );
}
