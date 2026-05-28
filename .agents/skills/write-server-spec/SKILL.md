---
name: write-server-spec
description: apps/server (NestJS) 의 jest spec(unit / integration) 을 작성·수정한다. 한국어 행위 제목, given/when/then 주석, when 1번 호출, 구현 의존 단어 금지 규칙을 적용한다. "서버 테스트 작성", "server spec 추가", "이 spec 정리", "/write-server-spec" 같은 발화에 트리거.
---

## 핵심 5개

1. **제목**: `"X 하면 Y 한다/된다"` 한국어 행위문
2. **구현 의존 단어 금지**: 예외 클래스명·상태 코드·프레임워크 디테일·자료구조 디테일·보안 기법명 제외
3. **`given` / `when` / `then`** 주석 3단계
4. **`when` 안 호출 1개**: 2개 이상이면 시나리오 혼재 또는 사전 조건 누락
5. **한 `it` 한 시나리오**: 한 응답의 여러 필드 검증은 OK, 서로 다른 시나리오는 분리

## 1. 제목 — "X 하면 Y 한다"

행위(조건)와 관찰 가능한 결과를 한국어 한 문장으로 잇는다. **구현이 바뀌어도 제목이 그대로 유효해야 한다.**

제목에 쓰면 안 되는 것:

- 예외 클래스명 (`Unauthorized`, `ConflictException`)
- HTTP 상태 코드 (`401`, `200`, `400`)
- 프레임워크/내부 식별자 (`ValidationPipe`, `payload`, `sub`, `LoginResult`)
- 보안 기법명 (`enumeration 방지`, `CSRF`)
- 응답 구조 디테일 (`body 의 X 필드`, `Set-Cookie 헤더`)
- 화살표 `→`, 영문 `should ... when ...`

✅ 좋은 예
```ts
it('이메일이 존재하지 않으면 인증 실패 메시지를 보낸다', ...);
it('로그인에 성공하면 사용자 식별 정보를 토큰에 담아 발급한다', ...);
it('인증 없이 /admin/posts 를 조회하면 거부된다', ...);
it('slug 가 중복되면 같은 slug 로 새 글 생성을 거부한다', ...);
```

❌ 나쁜 예
```ts
it('없는 email 이면 Unauthorized 를 던진다', ...);            // 예외 클래스명
it('정상 비번 → 200, HttpOnly 쿠키', ...);                    // 상태 코드 + 화살표
it('payload 에 sub/email/role 을 담아 sign 한다', ...);       // 내부 식별자
it('should return 200 when valid', ...);                       // 영문 should
it('로그인 성공 케이스', ...);                                  // 결과 없음
```

**예외**: API URL(`/auth/login`)은 외부 계약이라 허용. 순수 유틸 함수는 입력값 그대로 인용 (`"1d" 표기는 86_400_000 ms 로 변환된다`).

## 2. `given` / `when` / `then` 주석

```ts
it('이메일이 존재하지 않으면 인증 실패 메시지를 보낸다', async () => {
  // given: 해당 이메일의 사용자가 없는 상태
  users.findByEmail.mockResolvedValue(null);

  // when & then: 정해진 인증 실패 응답이 발생한다
  await expect(service.login('nope@x', 'pw')).rejects.toThrow(
    new UnauthorizedException(AuthError.invalidCredentials),
  );
});
```

- `// given:` 사전 조건 (mock 설정, DB seed). 없으면 `// given: 없음 — <왜 없는지>`
- `// when` 검증 대상 호출
- `// then` expect
- 호출 + 검증이 한 줄이면 `// when & then`
- 주석은 **코드가 무엇을 하는지가 아니라 의도/이유** 를 적는다
- `it.each` 매크로는 주석 생략 가능

## 3. `when` 안 호출 1개

`when` 안의 검증 대상 호출은 정확히 1개. 2개 이상이면 다음 셋 중 하나가 원인:

| 원인 | 해결 |
|---|---|
| 시나리오 두 개를 섞었다 | 별도 `it` 으로 분리 |
| 사전 조건이 `when` 에 섞였다 | `given` 으로 이동 |
| 검증 대상이 너무 잘게 쪼개져 있다 | 프로덕션 코드의 캡슐화 부족 신호, 리팩토링 검토 |

❌ 나쁜 예
```ts
it('로그아웃 직후 보호 endpoint 호출하면 거부된다', async () => {
  // given: 로그인 상태
  const atk = await loginAndGetCookie();

  // when: 2번 호출 — logout + me 가 한 when 안에
  await request(app.getHttpServer()).post('/auth/logout');
  const res = await request(app.getHttpServer()).get('/auth/me');

  // then
  expect(res.status).toBe(401);
});
```

✅ "logout 호출" 자체가 사전 조건이라면 `given` 으로
```ts
it('로그아웃 직후 보호 endpoint 호출하면 거부된다', async () => {
  // given: 로그인 후 즉시 로그아웃한 상태
  const atk = await loginAndGetCookie();
  await request(app.getHttpServer()).post('/auth/logout');

  // when
  const res = await request(app.getHttpServer()).get('/auth/me');

  // then
  expect(res.status).toBe(401);
});
```

supertest 체이닝(`.get().set().send()`)은 1번 호출로 카운트.

## 4. 한 `it` 한 시나리오

| OK (같은 시나리오의 여러 속성) | NG (서로 다른 시나리오) |
|---|---|
| 한 응답의 `user` / `expiresAt` / 토큰 부재 검증 | 로그인 성공 + 잘못된 비번 한 it 에 묶기 |
| 같은 쿠키의 HttpOnly / SameSite / Path 검증 | login → me → logout → me 체인 한 it 에 |

같은 시나리오 안에서도 측면이 명확히 분리되면 별도 `it`:

```ts
it('정상 자격증명으로 로그인하면 사용자 정보와 만료 시각을 응답한다', ...);
it('정상 자격증명으로 로그인하면 보안 속성이 적용된 인증 쿠키를 발급한다', ...);
```

## 5. 구조와 fixture

**`describe` 계층** — 외곽은 클래스/모듈, 내부는 메서드 또는 endpoint

```ts
describe('PostsService', () => {
  describe('create', () => {
    it('slug 가 중복되면 ...', ...);
  });
});

describe('AuthController + admin guard (integration)', () => {
  describe('POST /auth/login', () => { ... });
  describe('GET /auth/me', () => { ... });
});
```

**fixture & mock**
- 시드 객체: `makeX(overrides: Partial<X> = {})` 패턴
- mock 객체: `createXMock()` 함수로 묶어 매 테스트 새로 생성
- 통합 spec 의 공용 인프라(env 주입, DB seed, 쿠키 추출): `tests/X-helper.ts` 로 분리
- spec 한 곳에서만 쓰는 헬퍼: spec 내부 함수로

```ts
function makePost(overrides: Partial<Post> = {}): Post {
  return { id: '...', slug: 'hello', ...overrides };
}
```

## 6. 통합 spec (`*.integration.spec.ts`)

- 파일명 패턴: `*.integration.spec.ts` → `pnpm --filter server test:integration` 로 분리 실행
- testcontainers 가 postgres 컨테이너 자동 기동(`globalSetup`)
- 각 spec `beforeEach` 에서 `TRUNCATE ... RESTART IDENTITY CASCADE` 로 격리
- `AppModule` 직접 import 금지 — `ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })` + 필요한 sub-module 만 import
  - 이유: AppModule 의 `ConfigModule.forRoot` 는 `envFilePath` 의 `.env`(dev `DATABASE_URL`) 을 internal config 에 cache 하고, `ConfigService.get('DATABASE_URL')` 시 `process.env`(globalSetup 이 주입한 `TEST_DATABASE_URL`) 보다 이 cache 를 우선시한다. 결과적으로 통합 spec 이 dev DB 로 연결될 수 있으니 `ignoreEnvFile: true` 로 `.env` cache 를 꺼 `process.env` 만 신뢰한다.

검증:
```bash
pnpm --filter server check:ci
pnpm --filter server test:unit
pnpm --filter server test:integration
```

## 모범 사례 파일

- `apps/server/src/admin/auth/tests/auth.service.spec.ts` — unit, 행위 위주 제목