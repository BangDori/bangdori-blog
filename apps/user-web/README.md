# apps/user-web

Next.js 15 (App Router) 기반 개인 블로그 — [bangdori.kr](https://bangdori.kr)

## 데이터 흐름

- **글**: apps/server `/user/posts` 공개 read API(= admin CMS에서 발행된 DB 글) → `next-mdx-remote` 렌더링 — 홈 목록·`/blog/[slug]`, `domains/post`
- **조회수**: Redis (`post:{slug}:views`) — `/api/views/[slug]`
- **댓글**: Giscus (GitHub Discussions) — `/api/comments`로 카운트 조회
- **방문자**: Redis (`site:visitors`, `site:pageviews`) — `/api/stats`

## 실행

```bash
pnpm dev:user-web       # Turbopack dev server (포트 3000)
pnpm build:user-web     # production build (standalone output)
pnpm start:user-web     # production server
pnpm check:user-web     # Biome lint + format (자동 수정)
```


## 스타일

- Tailwind CSS v4 + `@tailwindcss/typography`
- shadcn/ui 컴포넌트 (`components/ui/`)
- Pretendard 폰트 (로컬)
- `next-themes` 다크/라이트 모드

## Import alias

`@/*` → `apps/user-web/` 루트 기준
