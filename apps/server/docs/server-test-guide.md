# server 테스트 가이드

## 1. 테스트 DB 준비

**중요**: `TEST_DATABASE_URL` 의 DB 이름에는 반드시 `test` 키워드를 포함시켜, 실수로 dev/prod DB를 가리키지 않도록 한다.

`pnpm docker:up`으로 띄운 postgres 컨테이너(`docker-postgres-1`, 호스트 포트 5433)에 별도 DB만 만든다.

```bash
docker exec docker-postgres-1 \
  psql -U bangdori -d postgres -c "CREATE DATABASE bangdori_blog_test;"
```

## 2. Migration

통합 테스트는 매 실행 시 Jest `globalSetup` 에서 `pnpm typeorm:ds migration:run` 을 자동 실행한다. 이때 `DATABASE_URL` 환경변수는 `TEST_DATABASE_URL` 값으로 덮어써져서 실행되므로, **개발/운영 DB에는 절대 영향을 주지 않는다.**

수동으로 동작 확인하려면:

```bash
cd apps/server
DATABASE_URL=$TEST_DATABASE_URL pnpm migration:run
```

## 3. 실행

```bash
# unit test (DB 불필요)
pnpm --filter server test:unit

# integration test (TEST DB 필요)
pnpm --filter server test:integration

# 둘 다
pnpm --filter server test
```

각 통합 테스트는 `beforeEach` 에서 `TRUNCATE TABLE "posts" RESTART IDENTITY CASCADE` 로 데이터를 정리하므로, 테스트 간 격리가 보장된다. **개발 DB의 데이터는 절대 건드리지 않는다.**