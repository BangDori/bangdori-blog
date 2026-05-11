# TypeORM Entity 데코레이터 메모

`posts` Entity에서 사용한 데코레이터와 선택 이유를 간단히 정리한다.

## 현재 Entity 구조

```ts
@Entity({ name: 'posts' })
@Unique('UQ_posts_slug', ['slug'])
@Index('IDX_posts_status_published_at', ['status', 'publishedAt'])
export class Post {
  @Column({
    type: 'enum',
    enum: PostStatus,
    enumName: 'posts_status_enum',
    default: PostStatus.DRAFT,
  })
  status!: PostStatus;
}
```

## 기본 원칙

이 프로젝트는 `synchronize: false`를 사용한다.

- Entity: 코드에서 테이블 구조와 의도를 표현
- Migration: 실제 DB 스키마 변경을 적용

따라서 제약조건, enum, index를 바꾸면 **Entity와 migration을 함께 수정**한다.

## `@Entity({ name: 'posts' })`

`Post` 클래스를 `posts` 테이블에 매핑한다.

테이블명을 명시하면 TypeORM의 자동 추론에 의존하지 않아 스키마 의도가 분명해진다.

## `@Column({ type: 'enum' })`

`status`는 Postgres enum type으로 관리한다.

```ts
export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
```

```ts
@Column({
  type: 'enum',
  enum: PostStatus,
  enumName: 'posts_status_enum',
  default: PostStatus.DRAFT,
})
status!: PostStatus;
```

DB에는 아래 enum type이 생성된다.

```sql
CREATE TYPE "posts_status_enum" AS ENUM ('draft', 'published', 'archived');
```

선택 이유:

- `status`는 핵심 도메인 상태값이다.
- 허용값을 DB 타입 레벨에서 강하게 고정한다.
- 잘못된 값은 DB에서 저장을 거부한다.

`enumName: 'posts_status_enum'`은 Postgres에 생성되는 enum type 이름이다. 이름을 직접 지정하면 migration과 DB 조회 시 식별하기 쉽다.

## `@Unique('UQ_posts_slug', ['slug'])`

`slug` 중복을 막는 unique constraint다.

```sql
CONSTRAINT "UQ_posts_slug" UNIQUE ("slug")
```

`id`는 primary key라서 이미 unique + not null이다. `slug`는 primary key가 아니지만 URL 식별자로 중복되면 안 되므로 별도 unique constraint를 둔다.

## `@Index('IDX_posts_status_published_at', ['status', 'publishedAt'])`

공개 글 목록 조회를 위한 복합 인덱스다.

예상 쿼리:

```sql
WHERE status = 'published'
ORDER BY published_at DESC
```

`publishedAt`은 Entity property 이름이고, 실제 DB 컬럼명은 `published_at`이다. TypeORM 데코레이터에는 property 이름을 쓴다.
