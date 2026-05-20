# bangdori-blog

개인 블로그 모노레포 — [bangdori.kr](https://bangdori.kr)

## Structure

```
apps/
  user-web/     # Next.js 블로그 (public)
  admin/        # Vite + React CMS 관리 페이지 (포트 3001)
  server/       # NestJS API 서버 (포트 4000)
```

## Getting Started

```bash
pnpm install
```

### user-web (Next.js 블로그)

```bash
pnpm dev:user-web     # 개발 서버
pnpm build:user-web   # 프로덕션 빌드
pnpm start:user-web   # 프로덕션 실행
```

### admin (CMS 관리 페이지)

```bash
pnpm dev:admin        # 개발 서버 (포트 3001)
pnpm build:admin      # 프로덕션 빌드
pnpm check:admin      # Biome lint + format
```

### server (NestJS API)

```bash
pnpm dev:server       # 개발 서버 (포트 4000, watch mode)
pnpm build:server     # 프로덕션 빌드
pnpm start:server     # 프로덕션 실행
```

### Health Check

```bash
curl http://localhost:4000/health
# → { "ok": true, "service": "server" }
```

## 빠른 검증

전체 스택을 띄워서 admin / user-web 화면을 검증할 때:

- 서버 띄우기
  - DB: `docker compose -f infra/docker/docker-compose.local.yml up -d postgres`
  - API: `pnpm dev:server` (NestJS watch, http://localhost:4000)
- 클라이언트 띄우기
  - 유저 웹: `pnpm dev:user-web` (http://localhost:3000)
  - 어드민: `pnpm dev:admin` (http://localhost:3001)

DB 종료: `docker compose -f infra/docker/docker-compose.local.yml down`

## Docker로 전체 띄우기

`infra/docker/docker-compose.local.yml` 기준 user-web / admin / server / postgres 4종을 production 빌드로 한 번에 띄운다 (hot-reload 없음).

```bash
pnpm docker:build     # 이미지 빌드만
pnpm docker:up        # 빌드 + 백그라운드 실행 (전체 스택)
pnpm docker:logs      # 로그 follow
pnpm docker:down      # 컨테이너/네트워크 정리
```
