# TypeORM Migration 가이드

## CLI 스크립트

| 스크립트 | DB 연결 | 설명 |
|---|---|---|
| `pnpm db:migration:create` | ❌ | 빈 migration 파일 생성 |
| `pnpm db:migration:run` | ✅ | 미실행 migration을 DB에 적용 |
| `pnpm db:migration:revert` | ✅ | 마지막 migration 1개 되돌리기 |

## 흐름 예시 — posts 테이블 추가

### 1. 빈 migration 파일 생성

```bash
pnpm db:migration:create src/migration/AddPostsTable
```

생성되는 파일:

```
packages/db/src/migration/1777819200000-AddPostsTable.ts
```

```ts
export class AddPostsTable1777819200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 비어있음
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 비어있음
  }
}
```

### 2. SQL 작성

`up()`에 적용할 SQL, `down()`에 되돌릴 SQL을 작성한다.

```ts
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`DROP TABLE posts`);
}
```

### 3. DB에 적용

```bash
pnpm db:migration:run
```

TypeORM이 내부적으로 하는 일:

1. DB에서 `migrations` 테이블을 확인 (없으면 자동 생성)
2. 이미 실행된 migration 목록과 `src/migration/*.ts` 파일들을 비교
3. 아직 실행 안 된 것만 순서대로 `up()` 실행
4. 실행 완료된 migration을 `migrations` 테이블에 기록

> migration 폴더 안의 `*.ts` 파일을 자동 순회하므로 별도 등록 과정은 필요 없다.

### 4. (문제 시) 되돌리기

```bash
pnpm db:migration:revert
```

가장 마지막 migration의 `down()`을 실행한다. 여러 개를 되돌리려면 여러 번 실행한다.

## migration 실행 확인

migration이 제대로 적용되었는지 DB에서 직접 확인할 수 있다:

```bash
docker exec -it <postgres-container> psql -U <user> -d <database> -c "SELECT * FROM migrations;"
```

실행하면 이런 결과가 나온다:

```
 id |   timestamp   |       name
----+---------------+-------------------
  1 | 1777971403663 | Init1777971403663
```

행이 있으면 해당 migration이 적용된 것이고, 없으면 아직 실행되지 않은 것이다.

## 요약

| 단계 | 명령 | 결과 |
|---|---|---|
| 파일 생성 | `pnpm db:migration:create` | 빈 migration .ts 파일 |
| SQL 작성 | 직접 코드 편집 | up() / down() 완성 |
| 적용 | `pnpm db:migration:run` | DB 스키마 변경 |
| 되돌리기 | `pnpm db:migration:revert` | 마지막 변경 취소 |

> migration은 DB의 git이다. git이 코드 변경 이력을 추적하듯, migration이 DB 스키마 변경 이력을 추적한다.
