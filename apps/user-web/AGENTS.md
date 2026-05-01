# user-web

Next.js 15 (App Router) 기반 개인 블로그 — [bangdori.kr](https://bangdori.kr)

## 핵심 데이터 흐름

- **글 저장소**: Notion DB → `notion-to-md`로 마크다운 변환 → `next-mdx-remote`로 렌더링
- **조회수**: Redis (`post:{slug}:views`) — GET/POST `/api/views/[slug]`
- **댓글**: Giscus (GitHub Discussions) — 프론트 컴포넌트 + `/api/comments`로 카운트 조회
- **방문자**: Redis (`site:visitors`, `site:pageviews`) — `/api/stats`

## 실행

```bash
pnpm dev:user-web       # Turbopack dev server
pnpm build:user-web     # production build
pnpm lint:user-web      # ESLint
pnpm format:user-web    # Prettier
```

## 스타일

- Tailwind CSS v4 + `@tailwindcss/typography`
- shadcn/ui 컴포넌트 (`components/ui/`)
- Pretendard 폰트 (로컬)
- `next-themes`로 다크/라이트 모드

## import alias

`@/*` → `apps/user-web/` 루트 기준 (`tsconfig.json` paths)
