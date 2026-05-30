# Server Layered Architecture

`apps/server`의 기능 모듈은 기본적으로 **Module → Controller → Service → Repository → Entity/Table** 흐름을 따른다. 이 문서는 `posts` CRUD API부터 적용할 서버 레이어 기준을 고정하기 위한 문서다.

## 결정 요약

- NestJS 기능 단위는 `*.module.ts`로 묶는다.
- HTTP 입구는 `Controller`가 담당한다.
- 비즈니스 규칙은 `Service`가 담당한다.
- DB 접근과 TypeORM query builder는 `Repository`가 담당한다.
- TypeORM `Entity`는 DB 스키마 매핑만 담당한다.
- 요청 모양은 `DTO`에서 관리한다.
- 응답은 기본적으로 Entity의 camelCase 필드를 그대로 반환하고, Entity와 API 응답 모양이 달라질 때만 mapper를 둔다.
- Controller와 Repository가 서로 직접 의존하지 않는다.

## 요청 처리 흐름

```text
HTTP Request
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
ORM Repository / Query Builder
  ↓
Entity / Table
```

예를 들어 `posts` 모듈에서는 위 추상 흐름이 `PostsController → PostsService → PostsRepository → TypeORM Repository<Post> → posts table`로 구체화된다.

## 레이어별 책임

| 레이어 | 책임 | 하지 말아야 할 것 |
|---|---|---|
| Module | NestJS DI 그래프 구성, controller/provider 등록 | 비즈니스 로직 작성 |
| Controller | route 선언, param/body/query DTO 수신, service 호출 | DB 접근, 상태 전이 판단 |
| Service | 비즈니스 규칙, 상태 전이, 404/409 같은 의미 있는 에러 변환 | TypeORM query builder 세부 구현 |
| Repository | DB 조회/저장, TypeORM repository 래핑, query builder 작성 | HTTP 응답 모양 결정, 정책 판단 |
| Entity | DB 컬럼/인덱스/제약조건 매핑 | request/response DTO 역할 |
| DTO | 입력 validation, query/body shape 정의 | DB 저장 방식 결정 |
| Mapper | Entity를 API response로 변환 | DB 접근, 상태 변경 |

## 의존 방향

허용되는 의존 방향:

```text
Controller → Service → Repository → Entity
DTO       → Service/Controller에서 사용
Mapper    → Service에서 사용
```

금지되는 의존 방향:

```text
Controller → Repository 직접 호출
Repository → Controller/HTTP exception 의존
Entity     → DTO 의존
DTO        → Repository 의존
```

## 기능 모듈 폴더 규칙

기능 모듈은 기본적으로 권한/노출면과 도메인을 함께 드러내는 `{surface}/{domain}` 구조로 나눈다. 여기서 `{surface}`는 `admin`(CMS), `user`(공개 블로그) 같은 클라이언트 노출면이고, `{domain}`은 `posts`, `analytics` 같은 기능 이름이다. 클라이언트 앱 `apps/admin` · `apps/user-web` 과 surface 이름을 맞춘다.

```text
apps/server/src/{surface}/{domain}/
├── {domain}.module.ts
├── {domain}.controller.ts
├── {domain}.service.ts
├── {domain}.repository.ts
├── {domain}.error.ts                     # 선택: 도메인 에러 메시지를 모을 때
├── {domain}.mapper.ts                    # 선택: entity → response 변환이 필요할 때
└── dto/
    ├── create-{resource}.dto.ts
    ├── update-{resource}.dto.ts
    ├── list-{resource}-query.dto.ts
    └── {resource}-response.dto.ts        # 선택
```

예를 들어 admin posts API는 `apps/server/src/admin/posts/` 아래에 둔다. 사용자(공개 블로그)용 posts read API는 `apps/server/src/user/posts/` 아래에 admin과 분리된 controller/service/repository로 둔다. 같은 `Post` entity를 공유하되 repository는 surface별로 자기 책임만 갖는다(admin은 전체 상태/CRUD, user는 발행·미삭제 read-only). user surface는 가드를 적용하지 않는 공개 endpoint다.

파일명은 이미 `{surface}/{domain}` 경로로 구분되므로 `posts.controller.ts`, `posts.service.ts`처럼 도메인 이름만 쓴다. 단, 외부 module에서 import되는 class 이름은 충돌을 피하기 위해 `AdminPostsModule`, `UserPostsModule`처럼 surface를 포함할 수 있다.

작은 기능이라도 DB 접근이 있으면 `Repository` 파일을 둔다. 처음에는 얇은 래퍼여도 괜찮다. 나중에 query 조건, pagination, transaction, lock, bulk update가 들어와도 Service가 비대해지지 않게 하기 위함이다.

## 파일 생성 기준

| 파일 | 언제 만든다 | 기준 |
|---|---|---|
| `*.module.ts` | 모든 기능 모듈 | NestJS DI 단위 |
| `*.controller.ts` | HTTP endpoint가 있을 때 | route 선언과 request 수신 |
| `*.service.ts` | 비즈니스 규칙이 있을 때 | 정책, 상태 전이, 에러 의미화 |
| `*.repository.ts` | DB 접근이 있을 때 | TypeORM repository/query builder 래핑 |
| `*.error.ts` | 도메인 에러 메시지가 2개 이상 생길 때 | 에러 문구 중앙 관리 |
| `*.mapper.ts` | entity와 response 모양이 다를 때 | API 응답 포맷 변환 |
| `dto/*.dto.ts` | body/query/response 타입이 필요할 때 | validation과 API shape 문서화 |

## API 설계 원칙

### 입력 필드와 서버 소유 필드 분리

create/update DTO에는 client가 직접 바꿀 수 있는 필드만 둔다. 아래처럼 서버가 소유하는 필드는 body에서 받지 않는다.

- id
- status 같은 상태 필드 중 별도 전이가 필요한 값
- count/cache/stat 계열 필드
- created_at / updated_at 같은 timestamp

서버 소유 필드를 변경해야 한다면 일반 update endpoint가 아니라 목적이 드러나는 별도 endpoint나 service method를 둔다.

### 상태 변경은 별도 use case로 분리

도메인 상태 변경에 부수효과가 있거나 검증 규칙이 다르면 `PATCH /:id`에 섞지 않는다.

예시:

```text
POST /{resources}/:id/publish
POST /{resources}/:id/archive
POST /{resources}/:id/activate
POST /{resources}/:id/deactivate
```

Service는 상태 전이 규칙을 담당하고, Repository는 저장만 담당한다.

### 목록 조회 기본값은 명시한다

list endpoint는 기본 조회 범위를 문서화한다.

- 전체 상태를 포함하는지
- 공개/활성 상태만 포함하는지
- 삭제/보관 상태를 제외하는지
- 기본 정렬이 무엇인지

기본값이 모호하면 client마다 다른 해석을 하게 되므로, controller/service 구현과 smoke test 문서에 함께 남긴다.

### 실제 변경이 없으면 저장하지 않는다

update 요청에서 실제로 바뀐 필드가 없으면 save를 호출하지 않는다. 이렇게 해야 `updated_at`이 의미 없는 요청으로 바뀌지 않는다.

## 에러 처리 기준

| 상황 | HTTP status | 담당 레이어 |
|---|---:|---|
| DTO validation 실패 | 400 | Global ValidationPipe |
| 리소스를 찾을 수 없음 | 404 | Service |
| unique constraint 위반 | 409 | Service 또는 공통 DB exception filter |
| 허용되지 않는 상태 전이 | 400 또는 409 | Service |
| 그 외 내부 에러 | 500 계열 | NestJS 기본 처리 |

Repository는 DB 에러를 숨기거나 HTTP exception으로 바꾸지 않는다. 도메인 의미로 변환해야 하는 에러는 Service 또는 공통 DB exception filter에서 처리한다.

## TypeORM Repository 래핑 기준

Service에서 `@InjectRepository(Entity)`를 직접 주입하지 않고, 기능별 repository를 주입한다.

```ts
@Injectable()
export class ResourcesRepository {
  constructor(
    @InjectRepository(ResourceEntity)
    private readonly repository: Repository<ResourceEntity>,
  ) {}

  findAll(filters: ListResourcesFilter) {
    // query builder는 repository 레이어에 둔다.
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  save(resource: ResourceEntity) {
    return this.repository.save(resource);
  }
}
```

Service는 아래처럼 정책 중심으로 읽히게 유지한다.

```ts
async transitionState(id: string) {
  const resource = await this.findResourceOrThrow(id);

  if (resource.isAlreadyTargetState()) {
    return resource;
  }

  resource.transitionState();

  return this.resourcesRepository.save(resource);
}
```

## Mapper 기준

기본 응답은 Entity의 camelCase 필드를 그대로 사용한다. 같은 admin/internal API에서 DTO 필드명과 Entity 필드명이 같다면 별도 mapper를 만들지 않는다.

Mapper는 아래처럼 Entity와 API 응답 모양이 실제로 달라질 때만 둔다.

```text
일부 내부 컬럼을 response에서 숨겨야 할 때
public API에서 admin Entity보다 좁은 응답을 내려야 할 때
Entity field name과 API field name을 다르게 가져가야 할 때
Date/bigint 같은 타입을 별도 정책으로 변환해야 할 때
```

이 변환이 필요해지더라도 Controller에 두지 않는다. Controller는 route와 service 호출만 담당한다.

## timestamp / counter 처리 원칙

`updated_at`은 사용자가 의미 있는 내용을 수정했거나 도메인 상태가 바뀌었을 때만 변경한다.

조회수, 집계값, 캐시값처럼 자주 바뀌는 counter 계열 필드는 별도 repository method로 처리한다.

```ts
incrementCounterWithoutTouchingUpdatedAt(id: string)
```

이 메서드는 ORM helper 또는 raw query를 사용하되, `updated_at`을 건드리지 않는지 반드시 확인한다.

soft delete도 같은 원칙을 따른다. 삭제 시에는 `deleted_at`만 갱신하고, 글 내용 수정 시각인 `updated_at`은 변경하지 않는다.