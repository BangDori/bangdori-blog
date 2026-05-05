# apps/server

NestJS API 서버 — 포트 4000

## 실행

```bash
# 개발 (watch mode)
pnpm dev:server

# 프로덕션 빌드 + 실행
pnpm build:server
pnpm start:server
```

## Health Check

```bash
curl http://localhost:4000/health
# → { "ok": true, "service": "server", "db": "ok" }
```

## DB (TypeORM)

entity, migration, seed 등 DB 관련 코드는 `src/database/` 에 위치한다.

```
src/database/
├── entity/             # TypeORM 엔티티
│   └── index.ts        # entities 배열 export
├── migration/          # TypeORM 마이그레이션
├── data-source.ts      # TypeORM CLI용 DataSource (dotenv 로드)
├── seed.ts             # 시드 스크립트
├── database.module.ts  # NestJS TypeOrmModule 설정
└── database.service.ts # health check용 서비스
```

### 마이그레이션 명령어

apps/server 안에서 실행:

```bash
pnpm migration:create src/database/migration/AddUser
pnpm migration:generate src/database/migration/AddUser
pnpm migration:run
pnpm migration:revert
```

### 시드

```bash
pnpm seed
```

