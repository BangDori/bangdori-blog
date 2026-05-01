'use client';

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

export default function GiscusComments() {
  const { theme } = useTheme();

  return (
    <Giscus
      repo="BangDori/bangdori-blog"
      repoId="R_kgDOO1vLWw"
      category="Announcements"
      categoryId="DIC_kwDOO1vLW84Crfyc"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme === 'light' ? 'light' : 'dark_dimmed'}
      lang="ko"
      loading="lazy"
    />
  );
}
