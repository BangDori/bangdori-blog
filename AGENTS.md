# bangdori-blog

개인 블로그 모노레포 — [bangdori.kr](https://bangdori.kr)

## 구조

```
apps/
  user-web/      # Next.js 블로그 (현재 유일한 실제 앱)
  admin/         # CMS 관리 페이지 (미구현)
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
- `pnpm dev:server` — NestJS 개발 서버 (포트 4000, watch mode)
- `pnpm build:server` — NestJS 프로덕션 빌드
- `pnpm start:server` — NestJS 프로덕션 실행
- `pnpm check:server` — Biome lint + format (자동 수정)

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
