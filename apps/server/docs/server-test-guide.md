# server 테스트 가이드

## 1. 사전 준비

**필요한 건 docker daemon 하나뿐.**

`pnpm test:integration` 은 jest `globalSetup` 에서 [testcontainers](https://node.testcontainers.org/) 로 Postgres 컨테이너를 직접 띄운다. 별도의 테스트 DB 생성, `TEST_DATABASE_URL` export, `.env` 설정이 모두 필요 없다.

- macOS: Docker Desktop / OrbStack 등 docker daemon 실행 중
- Linux/CI(ubuntu-latest): docker daemon 기본 실행 중

## 2. 동작 흐름

`apps/server/test/integration/global-setup.ts` 가 매 실행마다:

1. `postgres:16` 컨테이너를 띄운다 (testcontainers 가 임의 호스트 포트에 바인딩)
2. 그 컨테이너의 connection URI 를 `process.env.TEST_DATABASE_URL` 로 주입한다
3. `pnpm typeorm:ds migration:run` 으로 모든 migration 을 적용한다
4. 컨테이너 핸들을 `globalThis.__PG_CONTAINER__` 에 저장해둔다

`global-teardown.ts` 가 끝날 때 컨테이너를 stop 시킨다. 즉 테스트 run 자체가 격리된 일회용 DB 위에서 동작하므로, 개발/운영 DB 는 **절대** 건드리지 않는다.

## 3. 실행

```bash
# unit test (docker 불필요)
pnpm --filter server test:unit

# integration test (docker daemon 필요)
pnpm --filter server test:integration

# 둘 다
pnpm --filter server test
```

각 통합 테스트는 `beforeEach` 에서 `TRUNCATE TABLE ... RESTART IDENTITY CASCADE` 로 데이터를 정리해 테스트 간 격리도 보장한다.

## 4. 첫 실행이 느릴 때

처음 실행 시 docker hub 에서 `postgres:16` 이미지를 pull 한다 (수십 MB). 그 이후엔 로컬 캐시를 쓰므로 컨테이너 부팅·정리에 보통 2~4 초가 추가될 뿐이다. CI 도 마찬가지로 docker layer 캐시가 들어가면 빨라진다.

## 5. 디버깅 팁

- 컨테이너가 안 뜬다 → `docker info` 로 daemon 상태 먼저 확인
- migration 실패 → `apps/server/src/database/migration/` 하위 SQL 을 직접 본다
- 컨테이너가 남아있다 → testcontainers 가 prefix `testcontainers-*` 로 컨테이너를 만든다. `docker ps -a | grep testcontainers` 로 확인하고 `docker rm -f` 로 정리.
