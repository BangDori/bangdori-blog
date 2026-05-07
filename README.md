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
