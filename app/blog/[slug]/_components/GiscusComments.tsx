'use client';

import Giscus from '@giscus/react';

export default function GiscusComments() {
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
      theme="preferred_color_scheme"
      lang="ko"
      loading="lazy"
    />
  );
}
