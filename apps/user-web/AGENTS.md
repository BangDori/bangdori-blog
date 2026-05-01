# user-web

Next.js 15 (App Router) 기반 개인 블로그 — [bangdori.kr](https://bangdori.kr)

## 디렉토리 구조

```
app/
  page.tsx              # 홈
  about/page.tsx        # 소개
  blog/page.tsx         # 글 목록
  blog/[slug]/page.tsx  # 글 상세
  api/views/[slug]/     # 조회수 API (Redis)
  api/comments/         # 댓글 수 API (GitHub GraphQL)
  api/stats/            # 사이트 통계 API
  api/og/               # OG 이미지
  rss.xml/route.ts      # RSS
  sitemap.ts            # Sitemap
  robots.ts             # Robots
components/
  layouts/              # Header, Footer
  theme/                # ThemeProvider, ThemeToggle
  ui/                   # shadcn/ui (button, dropdown-menu, skeleton)
domains/
  post/
    api/notion.ts       # Notion API 클라이언트 (글 조회)
    types/index.ts      # Post 타입
    components/         # PostCard, PostList
hooks/
lib/
  redis.ts              # Redis 싱글톤 클라이언트
  date.ts               # 날짜 유틸
  utils.ts              # cn() 등
```

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

## 환경변수

| 변수 | 용도 |
|------|------|
| `NOTION_TOKEN` | Notion API 키 |
| `NOTION_DATABASE_ID` | 블로그 글 DB ID |
| `NEXT_PUBLIC_NOTION_SITE_URL` | Notion 이미지 프록시 base URL |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL (OG, sitemap 등) |
| `GITHUB_TOKEN` | 댓글 수 조회 (GitHub GraphQL) |
| `REDIS_URL` | Redis 연결 URL (조회수, 방문자) |

## 스타일

- Tailwind CSS v4 + `@tailwindcss/typography`
- shadcn/ui 컴포넌트 (`components/ui/`)
- Pretendard 폰트 (로컬)
- `next-themes`로 다크/라이트 모드

## import alias

`@/*` → `apps/user-web/` 루트 기준 (`tsconfig.json` paths)
