# DB 시간 컬럼 정책

서버 DB 시간 컬럼은 기본적으로 `timestamptz`를 사용하고, 저장/비교 기준은 UTC로 둔다.

## 적용 예시

```ts
@Column({ name: 'published_at', type: 'timestamptz', nullable: true })
publishedAt!: Date | null;

@CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
createdAt!: Date;

@UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
updatedAt!: Date;
```

Migration:

```sql
"published_at" timestamptz,
"created_at" timestamptz NOT NULL DEFAULT now(),
"updated_at" timestamptz NOT NULL DEFAULT now()
```

## 왜 UTC 기준인가?

- Docker/Linux/Cloud 환경은 기본 timezone이 UTC인 경우가 많다.
- DB에는 지역 시간이 아니라 절대 시각을 저장하는 편이 안전하다.
- Sentry, Docker logs, 외부 API 등과 timestamp를 비교하기 쉽다.
- 화면/API에서는 필요한 timezone으로 변환해서 보여주면 된다.

정책:

- DB 저장/비교: UTC
- 한국 사용자 표시: `Asia/Seoul`
- KST 기준 일별 통계: 조회/집계 시점에 `Asia/Seoul`로 변환

## `timestamptz` 주의점

Postgres `timestamptz`는 timezone 이름을 저장하는 타입이 아니다.

- 입력된 시간을 절대 시각으로 해석한다.
- 내부적으로 UTC 기준으로 정규화한다.
- 조회할 때 DB 세션 timezone 기준으로 표시한다.

같은 시각도 세션 timezone에 따라 다르게 보일 수 있다.

```text
UTC        2026-05-11 14:41:44+00
Asia/Seoul 2026-05-11 23:41:44+09
```

둘은 같은 절대 시각이다.

## KST 기준 집계 예시

```sql
SELECT
  DATE(created_at AT TIME ZONE 'Asia/Seoul') AS kst_date,
  COUNT(*)
FROM posts
GROUP BY kst_date
ORDER BY kst_date DESC;
```

## 확인 명령어

```bash
docker exec docker-postgres-1 psql -U bangdori -d bangdori_blog -c \
  "SELECT current_setting('TimeZone') AS timezone, now() AS now_timestamptz;"
```
