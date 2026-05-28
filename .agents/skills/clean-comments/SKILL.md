---
name: clean-comments
description: 코드의 불필요한 주석을 식별하고 정리한다. "/clean-comments", "주석 정리해줘", "자명한 주석 빼줘", "이 파일 주석 검토" 같은 발화에 트리거. 주석 정책의 SSOT.
---

# Clean Comments

코드만 읽어도 의도가 드러난다면 주석은 쓰지 않는다. 주석은 **코드가 스스로 말하지 못하는 것** (왜·제약·non-obvious한 결정)만 담는다. 이 스킬은 그 정책과 그걸 코드에 적용하는 절차를 함께 정의한다.

## 주석 정책

### 4축 규칙

1. **What 주석은 쓰지 않는다** — 변수명/함수명/key가 이미 드러내는 동작을 한 줄 더 풀어 쓰는 주석은 금지.
   - ❌ `// 오늘 방문자 수` → `const todayVisits = redis.get(...)` 자체로 충분
   - ❌ `// 게시물 조회수만 증가` → ``redis.incr(`post:${slug}:views`)`` 자체로 충분
   - ❌ `// Redis 클라이언트를 재사용하기 위한 싱글톤 패턴` → 코드 모양이 곧 싱글톤
   - ❌ `.map(getPostMetadata); // 포스트 메타데이터 추출` — 함수명이 곧 의도
2. **Why·제약·비자명 동작은 남긴다** — 보안 고려·타이밍·트레이드오프·외부 시스템 quirk·라이브러리 동작 가정.
   - ✅ `// 타이밍 공격 방어 — docs/admin-auth-security.md "사용자 enumeration 방어선" 참조`
   - ✅ `// argon2.verify reject 는 비번 불일치(false)가 아니라 hash 손상(시스템 에러)이다.`
   - ✅ `// 캐시 갱신으로 initial 이 새로 내려와도 사용자가 입력 중이면 덮어쓰지 않게 dirty 체크 후 skip`
3. **공개 API JSDoc만 유지** — 패키지/모듈 경계의 props·옵션은 IDE 호버에서 가치가 있으므로 JSDoc 유지. 내부 함수의 `@param`/`@returns` 보일러플레이트는 제거.
   - ✅ `apps/admin/src/shared/ui/field.tsx` — `FieldProps` 필드별 `/** ... */` 한 줄 설명
   - ❌ 함수 시그니처와 똑같은 내용을 풀어 쓴 `@param page 페이지 객체 @returns 포스트 메타데이터`
4. **풀이형 주석·작성용 단계 주석 금지** — 트레일링 코멘트, `// ① ... // ② ...` 같은 학습용 step, `return null; // 화면에 아무것도 렌더링하지 않음` 같은 자기참조 주석.
   - 예외: 도구 지시 주석 (`// biome-ignore ...`, `// @ts-check`, `/// <reference ...>`)

### 길이·형태 가이드

- **JSDoc 블록은 보수적으로** — 3줄 넘는 docstring 작성 전, "이건 변수명/함수명/타입으로 표현 가능한가?"를 먼저 따진다.
- **상세 설명은 docs/ 로 외부화** — 보안 정책·아키텍처 결정처럼 길어지면 `apps/server/docs/` 또는 세션 `docs/` 의 .md/.html에 두고, 코드에는 `// ... — docs/<file> 참조` 한 줄만 남긴다.
- **반환값·분기 풀이는 한 문장으로 압축** — "true면 X, false면 Y, reject면 Z" 같은 케이스 나열은 한 줄로 의도만 적는다.
- **TODO / FIXME 는 이슈/PR 링크와 함께** — 단순 "// TODO: 나중에 처리"는 영원히 남는다. 처리 시점 단서가 있어야 한다.

### 기존 코드에 적용할 때

작업 중인 파일에서 위 규칙에 어긋나는 주석을 발견하면 같은 변경 단위에서 함께 정리한다. 단, **수정하지 않은 파일의 주석은 건드리지 않는다** (review noise 방지). 전체 정리가 필요하면 이 스킬을 `/clean-comments` 로 명시적으로 호출한다.

## 워크플로우

### Phase 1: 대상 파일 결정

발화 형태별 기본값:

| 발화 | 대상 |
|------|------|
| `/clean-comments` (인자 없음) | `git diff --name-only origin/develop...HEAD` 의 변경 파일 |
| `/clean-comments <경로>` | 인자로 지정된 파일/디렉토리 |
| `/clean-comments staged` | `git diff --cached --name-only` |
| `주석 정리해줘` (대화 맥락에 파일 있음) | 그 파일 |

대상이 10개 이상이면 사용자에게 묻고 우선순위를 정한다.

### Phase 2: 후보 식별

각 파일을 읽어 다음 패턴을 표시한다:

**제거 후보 (Strong)**
- 변수/함수/key를 그대로 풀어쓴 한 줄 주석
- 트레일링 코멘트가 함수명·메서드명을 반복
- `@param x ... @returns ...` 만 있고 시그니처 이상의 정보가 없는 JSDoc
- `// ① ... // ② ...` 같은 학습용 step 주석 (테스트 포함)
- `return null; // 아무것도 안 함` 같은 자기참조 주석
- 모듈/클래스 상단의 "이 클래스의 책임은 ..." docstring (클래스명·메서드명이 이미 책임을 드러낼 때)

**압축 후보 (Compress)**
- 3줄 이상이지만 한 줄로 줄여도 의도가 전달되는 JSDoc/블록 주석
- "true/false/reject 각각의 의미" 같은 케이스 나열 → 한 문장으로
- 별도 docs(.md/.html) 에 동일 내용이 있으면 본문 풀이는 제거하고 `// ... — docs/<file> 참조` 한 줄로 치환

**유지 (Keep)**
- 보안·타이밍·트레이드오프·외부 시스템 quirk·라이브러리 동작 가정 같은 Why
- 공개 API의 props/옵션 JSDoc (IDE 호버 가치)
- 도구 지시: `// biome-ignore ...`, `// @ts-check`, `/// <reference ...>`, `// eslint-disable-next-line ...`
- TODO/FIXME 중 이슈·PR 링크가 함께 적힌 것

### Phase 3: 변경안 제시 (사용자 승인)

후보를 모아 다음 포맷으로 보고하고 `AskUserQuestion`으로 확인한다:

```
[file:line] 분류 → 변경안

apps/user-web/app/api/stats/route.ts:8  제거  // 오늘 날짜 (YYYY-MM-DD)
  근거: 다음 줄 ``new Date().toISOString().split('T')[0]`` 가 자명

apps/server/src/admin/users/users.service.ts:11-17  압축  /** admin/CMS 사용자 ... */
  근거: 클래스명 + admin-auth-security.md 가 책임 명시
  대안: 완전 제거

...

진행 옵션:
- (1) 전부 제거/압축
- (2) Strong 만 적용, Compress 는 보존
- (3) 항목별 토글
- (4) 보류
```

판정이 애매한 항목은 별도 "🤔 판단 필요" 섹션으로 분리해 사용자에게 결정을 위임한다 — **임의로 지우지 않는다.**

### Phase 4: 적용

승인된 항목만 `Edit` 으로 변경한다. 한 파일 안의 여러 주석은 한 번의 `Edit` 호출에 합친다.

### Phase 5: 검증 + 커밋 안내

1. `pnpm check:<app>` 으로 lint/format 자동 수정 통과 확인 (변경된 app 만)
2. `git diff --stat` 으로 변경 규모 보고
3. 커밋 메시지 후보 제시:
   - 단일 app 단위: `refactor(<app>): 자명한 주석 정리`
   - 여러 app: `refactor: 자명한 주석 정리`

커밋 자체는 `/commit` 스킬로 위임한다.

## 절대 하지 말 것

- **코드 로직 변경 동반 금지** — 이 스킬은 주석/JSDoc 만 손댄다. 함께 발견된 버그·리팩토링 후보는 별도로 보고하고 다른 작업으로 분리.
- **import/타입 시그니처 변경 금지** — JSDoc 안의 `@param` 만 지우고 함수 시그니처는 그대로 둔다.
- **테스트 given/when/then 의 일관성 깨기 금지** — 같은 파일 안에서 일부만 지우면 가독성이 더 나빠진다. 한 파일은 전부 유지 / 전부 제거 중 하나로.
- **사용자 승인 없는 docs 참조 치환 금지** — 압축할 때 `// ... — docs/X 참조` 로 바꾸려면 그 docs 가 실제 존재하고 내용이 맞는지 먼저 확인하고 승인을 받는다.

## 참조

- 루트 [`AGENTS.md`](../../../AGENTS.md) "코드 스타일 — 주석" 섹션이 이 스킬을 가리킨다.
- 커밋 절차: [`../commit/SKILL.md`](../commit/SKILL.md)
- 적용 예시 커밋: `git show 385dbb2` — `refactor(server): 자명한 주석 정리`
