'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // clipboard를 지원하지 않는 경우
      // 임시 입력창을 생성한 후, 입력값을 복사
      const textArea = document.createElement('textarea');

      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();

      document.execCommand('copy');

      document.body.removeChild(textArea);
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Button
      type="button"
      className="text-muted-foreground cursor-pointer text-sm"
      onClick={handleCopy}
      aria-label="링크 복사하기"
      variant="ghost"
    >
      {copied ? '✅ 복사 완료' : '링크 복사하기'}
    </Button>
  );
}
