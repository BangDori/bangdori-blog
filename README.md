# bangdori-blog

개인 블로그 모노레포 — [bangdori.kr](https://bangdori.kr)

## Structure

```
apps/
  user-web/     # Next.js 블로그 (public)
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
