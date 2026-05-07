# apps/admin

CMS 관리 페이지 — Vite + React SPA (포트 3001)

## Getting Started

```bash
pnpm dev:admin     # 개발 서버 (포트 3001)
pnpm build:admin   # 프로덕션 빌드
pnpm check:admin   # Biome lint + format
```

## Stack

- **Runtime:** Vite 6 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + `@bangdori/ui/css/tokens.css` 디자인 토큰
- **Routing:** react-router-dom v7
- **Lint/Format:** Biome

## 현재 상태

- 기본 레이아웃 + Dashboard placeholder 페이지만 존재
- 인증, CMS 기능, API 연동은 미구현
