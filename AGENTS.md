# bangdori-blog

개인 블로그 모노레포 — [bangdori.kr](https://bangdori.kr)

## 구조

```
apps/
  user-web/      # Next.js 블로그 (public)
  admin/         # Vite + React CMS 관리 페이지
  server/        # NestJS API 서버 (포트 4000, health check only)
packages/
  ui/            # 공유 UI 컴포넌트 (미구현)
  contracts/     # 공유 타입·DTO·상수 (미구현)
  analytics/     # 자체 analytics SDK (미구현)
infra/
  docker/        # Dockerfile, docker-compose (미구현)
  caddy/         # Caddy reverse proxy (미구현)
  scripts/       # 배포·운영 스크립트 (미구현)
```

## 개발 환경

- Node 24, pnpm 10
- `pnpm dev:user-web` — 개발 서버 (Turbopack)
- `pnpm build:user-web` — 프로덕션 빌드
- `pnpm check:user-web` — Biome lint + format (자동 수정)
- `pnpm dev:admin` — Vite 개발 서버 (포트 3001)
- `pnpm build:admin` — 프로덕션 빌드
- `pnpm check:admin` — Biome lint + format (자동 수정)
- `pnpm dev:server` — NestJS 개발 서버 (포트 4000, watch mode)
- `pnpm build:server` — NestJS 프로덕션 빌드
- `pnpm start:server` — NestJS 프로덕션 실행
- `pnpm check:server` — Biome lint + format (자동 수정)

## 빠른 검증

전체 스택을 띄워서 admin / user-web 화면을 검증할 때:

- 서버 띄우기
  - DB: `docker compose -f infra/docker/docker-compose.local.yml up -d postgres`
  - API: `pnpm dev:server` (NestJS watch, http://localhost:4000)
- 클라이언트 띄우기
  - 유저 웹: `pnpm dev:user-web` (http://localhost:3000)
  - 어드민: `pnpm dev:admin` (http://localhost:3001)

DB 종료: `docker compose -f infra/docker/docker-compose.local.yml down`

## 브랜치 전략

- `main` — 프로덕션
- `develop` — 통합 브랜치
- 작업 브랜치: `feature/*`, `fix/*`, `refactor/*`, `chore/*`
- base: `develop`에서 분기, `develop`으로 PR

## 커밋 컨벤션

Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `test:`

## PR 규칙

- 제목: 커밋 컨벤션과 동일한 prefix
- 본문: 변경 사항 요약 + 검증 방법
- base branch: `develop`

## 디자인 시스템

- UI 작업 시 프로젝트 루트의 `DESIGN.md`를 반드시 참고한다.
- 새로운 색상이나 컴포넌트를 추가할 때는 `DESIGN.md` 토큰을 먼저 업데이트하고, `globals.css`의 CSS 변수와 일치시킨다.
