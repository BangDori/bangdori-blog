# @bangdori-blog/db

TypeORM 기반 데이터베이스 패키지.

## 사용법

```bash
# migration 생성 (빈 파일)
pnpm db:migration:create src/migration/InitSchema

# migration 실행
pnpm db:migration:run

# migration 되돌리기
pnpm db:migration:revert

# seed
pnpm db:seed
```
